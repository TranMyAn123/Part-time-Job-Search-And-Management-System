const fetchApplications = useCallback(async (isRefresh = false) => {
    if (!user) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
        const res = await authApis(user.access_token).get(endpoints["applications"]);
        setApplications(res.data.results ?? res.data ?? []);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
}, [user]);

useEffect(() => {
    fetchApplications();
}, [fetchApplications]);