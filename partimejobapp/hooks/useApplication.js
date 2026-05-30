export function useApplications(user) {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const fetchApplications = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await authApis(user.access_token).get(endpoints["applications"]);
            setApplications(res.data.results);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const refresh = () => {
        setRefreshing(true);
        fetchApplications();
        setActiveFilter("ALL");
    };

    useEffect(() => {
        fetchApplications();
    }, [user]);

    return { applications, activeFilter, setActiveFilter, loading, refreshing, refresh };
}