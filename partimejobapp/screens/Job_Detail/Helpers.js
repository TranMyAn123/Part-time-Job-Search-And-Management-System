import { BENEFIT_ICONS } from "../../configs/Icons";

export function getJobPalette(job) {
    return {
        color: job.color,
        bgColor: job.bgColor
    }
}

export function getInitials(name = "") {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }
    return words
        .map(w => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export function formatSalary(min, max) {
    const a = parseFloat(min ?? 0);
    const b = parseFloat(max ?? 0);
    if (!a && !b) return "Thỏa thuận";
    if (a && b) return `${(a / 1e6).toFixed(0)}–${(b / 1e6).toFixed(0)} triệu/tháng`;
    if (a) return `Từ ${(a / 1e6).toFixed(0)} triệu/tháng`;
    return `Đến ${(b / 1e6).toFixed(0)} triệu/tháng`;
}

export function formatDate(iso) {
    if (!iso) return "—";
    // "2026-06-30" → "30/06/2026"
    const parts = iso.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return iso;
}

export function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Hôm nay";
    if (days === 1) return "1 ngày trước";
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    return `${months} tháng trước`;
}

// Parse benefits string thành mảng (split by dấu phẩy)
export function parseBenefits(str = "") {
    return str.split(",").map((s) => s.trim()).filter(Boolean);
}

// Parse requirement string thành mảng (split by dấu phẩy hoặc xuống dòng)
export function parseRequirements(str = "") {
    return str
        .split(/,|\n/)
        .map((s) => s.trim())
        .filter(Boolean);
}

export function benefitIcon(text) {
    const lower = text.toLowerCase();
    for (const [key, icon] of Object.entries(BENEFIT_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return "check-circle-outline";
}