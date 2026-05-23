export const STATUS_CONFIG = {
    REVIEWING: { label: "Chờ xét duyệt", color: "#F97316", bgColor: "#FFF4ED", icon: "clock-outline" },
    INTERVIEW: { label: "Hẹn phỏng vấn", color: "#185FA5", bgColor: "#EBF4FF", icon: "calendar-check-outline" },
    ACCEPTED: { label: "Trúng tuyển", color: "#16A34A", bgColor: "#DCFCE7", icon: "check-circle-outline" },
    REJECTED: { label: "Trượt", color: "#EF4444", bgColor: "#FEF2F2", icon: "close-circle-outline" },
    WITHDRAWN: { label: "Rút đơn", color: "#6B7280", bgColor: "#F3F4F6", icon: "undo-variant" },
    CANCELLED: { label: "Đã hủy", color: "#9CA3AF", bgColor: "#F9FAFB", icon: "cancel" },
};

export const FILTERS = [
    { key: "ALL", label: "Tất cả" },
    { key: "REVIEWING", label: "Chờ duyệt" },
    { key: "INTERVIEW", label: "Phỏng vấn" },
    { key: "ACCEPTED", label: "Trúng tuyển" },
    { key: "REJECTED", label: "Trượt" },
    { key: "WITHDRAWN", label: "Rút đơn" },
    { key: "CANCELLED", label: "Đã hủy" },
];