export default function (str: String, length: number) {
    if(str == null || str?.length <= length) return str;

    return str.substr(0, length - 1) + "**\u2026**";
}
