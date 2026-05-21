import { useRef, useCallback, useEffect, useState } from "react";
import Apis, { endpoints } from "../configs/Apis";

export function useIndustries() {
    const [industries, setIndustries] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await Apis.get(endpoints["industries"]);
            setIndustries(res.data)
        } catch (err) {
            const msg =
                err?.response?.data?.detail ??
                err?.response?.data?.message ??
                "Không thể tải danh sách việc làm.";
            setError(msg);
        } finally {
            setLoading(false)
        }
    }, [])
    useEffect(() => {
        fetchData()
    }, [])
    return { industries, loading, error };

}
