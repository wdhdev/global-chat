import axios, { AxiosResponse } from "axios";

export default async function (text: string, from: CountryCode | "auto" = "auto", to: CountryCode): Promise<Response> {
    const res: AxiosResponse = await axios("https://api.pawan.krd/gtranslate", {
        method: "GET",
        params: {
            from,
            to,
            text
        }
    })

    const data: Response = res.data;

    return data;
}

type CountryCode = "af" | "sq" | "am" | "ar" | "hy" | "as" | "ay" | "az" | "bm" | "eu" | "be" | "bn" | "bho" | "bs" | "bg" | "ca" | "ceb" | "zh-CN" | "zh" | "zh-TW" | "co" | "hr" | "cs" | "da" | "dv" | "doi" | "nl" | "en" | "eo" | "et" | "ee" | "fil" | "fi" | "fr" | "fy" | "gl" | "ka" | "de" | "el" | "gn" | "gu" | "ht" | "ha" | "haw" | "he" | "iw" | "hi" | "hmn" | "hu" | "is" | "ig" | "ilo" | "id" | "ga" | "it" | "ja" | "jv" | "jw" | "kn" | "kk" | "km" | "rw" | "gom" | "ko" | "kri" | "ku" | "ckb" | "ky" | "lo" | "la" | "lv" | "ln" | "lt" | "lg" | "lb" | "mk" | "mai" | "mg" | "ms" | "ml" | "mt" | "mi" | "mr" | "mni" | "lus" | "mn" | "my" | "ne" | "no" | "ny" | "or" | "om" | "ps" | "fa" | "pl" | "pt" | "pa" | "qu" | "ro" | "ru" | "sm" | "sa" | "gd" | "nso" | "sr" | "st" | "sn" | "sd" | "si" | "sk" | "sl" | "so" | "es" | "su" | "sw" | "sv" | "tl" | "tg" | "ta" | "tt" | "te" | "th" | "ti" | "ts" | "tr" | "tk" | "ak" | "uk" | "ur" | "ug" | "uz" | "vi" | "cy" | "xh" | "yi" | "yo" | "zu";

type Response = {
    status: true;
    translated?: string;
    time?: number;
}
