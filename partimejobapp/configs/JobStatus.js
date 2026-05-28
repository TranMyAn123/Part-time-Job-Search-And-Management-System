export const JOB_STATUS_CONFIG = {
    OPENING: { label: "Đang tuyển", color: "#16A34A", bgColor: "#DCFCE7", icon: "briefcase-check-outline" },
    PENDING: { label: "Chờ duyệt",  color: "#CA8A04", bgColor: "#FEF9C3", icon: "clock-outline" },
    CLOSED:  { label: "Đã đóng",    color: "#6B7280", bgColor: "#F3F4F6", icon: "briefcase-off-outline" },
};

export const JOB_FILTERS = [
    { key: "ALL",     label: "Tất cả" },
    { key: "OPENING", label: "Đang tuyển" },
    { key: "PENDING", label: "Chờ duyệt" },
    { key: "CLOSED",  label: "Đã đóng" },
];