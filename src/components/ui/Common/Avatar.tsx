import { getAvatar } from "@/utils/common/common"

export const Avatar = ({ fullname }: { fullname: string }) => {
    return <img
        src={getAvatar(fullname)}
        alt={fullname}
        className="object-cover"
        sizes="48px"
    />
}