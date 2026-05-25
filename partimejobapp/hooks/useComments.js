import { useState, useCallback, useContext } from "react";
import Apis, { authApis, endpoints } from "../configs/Apis"
import { MyUserContext } from "../configs/Contexts";
export function useComments(jobID) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [nextUrl, setNextUrl] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState(null);
    const [user] = useContext(MyUserContext);
    const [replies, setReplies] = useState({});

    const fetchComments = useCallback(async (url = null) => {
        setLoading(true);
        try {
            const res = await Apis.get(url || endpoints["comments"](jobID))
            const data = res.data
            setComments((prev) => url ? [...prev, ...data.results] : data.results);
            setNextUrl(data.next);
            setHasMore(data.next ? true : false);
        } catch (e) {
            const msg =
                error?.response?.data?.detail ??
                error?.response?.data?.message ??
                "Không thể tải danh sách comments";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [jobID]);

    const loadMoreComments = useCallback(() => {
        if (nextUrl && !loading) fetchComments(nextUrl);
    }, [nextUrl, loading, fetchComments]);

    const fetchReplies = useCallback(async (commentID, url = null) => {
        setReplies((prev) => ({
            ...prev,
            [commentID]: { ...prev[commentID], loading: true },
        }));
        try {
            const res = await Apis.get(endpoints['replies'](commentID))
            const data = res.data
            setReplies((prev) => ({
                ...prev,
                [commentID]: {
                    data: url
                        ? [...(prev[commentID]?.data ?? []), ...data.results]
                        : data.results,
                    loading: false,
                    nextUrl: data.next,
                    hasMore: data.next ? true : false
                },
            }));
        } catch (e) {
            const msg =
                error?.response?.data?.detail ??
                error?.response?.data?.message ??
                "Không thể tải danh sách comments";
            setError(msg);
        }
    }, []);

    // ── Post comment hoặc reply ───────────────────────────────────────────────
    const postComment = useCallback(async (content, parentID = null) => {
        if (!content.trim()) return;
        if (!user) alert("Bạn phải đăng nhập để thực hiện bình luận")

        try {
            setPosting(true);
            // Dùng authApis để gửi token (ở đây đang dùng token từ database
            const res = await authApis(user.access_token).post(
                endpoints['comments'](jobID),
                {
                    content,
                    parent: parentID
                }
            );
            const newComment = res.data
            if (!parentID) {
                // Comment cha
                setComments((prev) => [...prev, newComment]);
            } else {
                // Reply
                setReplies((prev) => ({
                    ...prev,
                    [parentID]: {
                        ...prev[parentID],
                        data: [
                            ...(prev[parentID]?.data ?? []),
                            newComment,
                        ],
                    },
                }));

                // Tăng số lượng replies
                setComments((prev) =>
                    prev.map((c) =>
                        c.id === parentID
                            ? {
                                ...c,
                                reply_count: (c.reply_count ?? 0) + 1,
                            }
                            : c
                    )
                );
            }
        } catch (e) {
            const msg =
                e?.response?.data?.detail ??
                e?.response?.data?.message ??
                "Không thể đăng bình luận";

            console.log(msg);
        } finally {
            setPosting(false);
        }
    }, [jobID]);

    return {
        comments,
        loading,
        posting,
        hasMore,
        replies,
        fetchComments,
        loadMoreComments,
        fetchReplies,
        postComment,
    };
}