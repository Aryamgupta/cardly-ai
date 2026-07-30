export function getAvatar(full_name: string, size: number = 150): string {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name || "Unknown")}&background=random&color=fff&size=${size}`;
    return avatarUrl;
}