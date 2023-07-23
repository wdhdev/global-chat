export default function (url: any): string {
    let domain = url.replace(/^(https?:\/\/)?/, "");
    domain = domain.replace(/^www\./i, "");
    domain = domain.split("/")[0];

    return domain;
}
