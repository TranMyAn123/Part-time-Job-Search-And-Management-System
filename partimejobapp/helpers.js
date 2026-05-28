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

<<<<<<< HEAD
export function getFullName(candidate) {
    const full = `${candidate.last_name} ${candidate.first_name}`.trim();
    return full || "Chưa có tên";
}

=======
>>>>>>> origin/frontend/login_register
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

export function formatDateTime(iso) {
    if (!iso) return "—";
    const parts = iso.split("T")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function timeAgoByDate(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Hôm nay";
    if (days === 1) return "1 ngày trước";
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    return `${months} tháng trước`;
}

export function timeAgoByTime(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return `${Math.floor(days / 30)} tháng trước`;
}