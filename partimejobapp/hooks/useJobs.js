import { useRef, useCallback, useEffect, useState } from "react";
import Apis, { authApis, endpoints } from "../configs/Apis";

export function useJobs({ industry = "Tất cả", query = "", token }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const page = useRef(1);
    const loadingRef = useRef(false);

    const fetchJobs = async ({ pageToFetch = 1, append = false } = {}) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const params = {
                page: pageToFetch,
                ...(industry !== "Tất cả" && { industry_name: industry }),
                ...(query.trim() && { q: query.trim() }),
            };
            let res;
            if (token)
                res = await authApis(token).get(endpoints["jobs"], { params })
            else
                res = await Apis.get(endpoints["jobs"], { params });
            const newJobs = res.data.results ?? [];

            setJobs((prev) => (append ? [...prev, ...newJobs] : newJobs));
            setHasMore(!!res.data.next);
        } catch (err) {
            const msg =
                err?.response?.data?.detail ??
                err?.response?.data?.message ??
                "Không thể tải danh sách việc làm.";
            setError(msg);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    };

    useEffect(() => {
        page.current = 1;
        setJobs([]);
        setHasMore(true);
        setError(null);
        fetchJobs({ pageToFetch: 1, append: false });
    }, [industry, query]);

    const loadMore = () => {
        if (loadingRef.current || !hasMore) return;
        const next = page.current + 1;
        page.current = next;
        fetchJobs({ pageToFetch: next, append: true });
    };

    const refresh = async () => {
        if (loadingRef.current) return;
        setRefreshing(true);
        page.current = 1;
        setHasMore(true);
        setError(null);

        try {
            const params = {
                page: 1,
                ...(industry !== "Tất cả" && { industry_name: industry }),
                ...(query.trim() && { search: query.trim() }),
            };

            let res;
            if (token)
                res = await authApis(token).get(endpoints["jobs"], { params })
            else
                res = await Apis.get(endpoints["jobs"], { params }); setJobs(res.data.results ?? []);
            setHasMore(!!res.data.next);
        } catch (err) {
            const msg =
                err?.response?.data?.detail ??
                err?.response?.data?.message ??
                "Không thể tải danh sách việc làm.";
            setError(msg);
        } finally {
            setRefreshing(false);
        }
    };

    return { jobs, loading, refreshing, error, hasMore, loadMore, refresh };
}
