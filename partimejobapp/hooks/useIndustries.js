import { useRef, useCallback, useEffect, useState } from "react";
import Apis, { endpoints } from "../configs/Apis";

export function useIndustries() {
    const [industries, setIndustries] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);

    const fetchData = async
}