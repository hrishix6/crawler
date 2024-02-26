import { JSDOM } from "jsdom";
import fetch from "node-fetch";

export function normalizeURL(url: string) {
    const parsedUrl = new URL(url);
    return `${parsedUrl.hostname}${parsedUrl.pathname}`;
}

interface URLInfo {
    url: string;
    internalLinks: string[];
    externalLinks: string[];
}

export function getUrlsFromHtml(url: string, html: string, baseUrl: string) {
    const dom = new JSDOM(html, {
        url: baseUrl
    });

    const { document } = dom.window;
    const linkEls = document.querySelectorAll("a");

    const info: URLInfo = {
        url: normalizeURL(url),
        internalLinks: [],
        externalLinks: []
    }

    if (!linkEls || linkEls.length == 0) {
        return info;
    }

    for (let link of linkEls) {

        if (IsInternalUrl(link.href, baseUrl)) {
            info.internalLinks.push(link.href);
        }
        else {
            info.externalLinks.push(link.href);
        }
    }


    return info;
}

export function IsInternalUrl(url: string, baseUrl: string) {
    return new URL(url).hostname === new URL(baseUrl).hostname;
}


export async function fetchPage(url: string): Promise<string | null> {

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text/html")) {
            return null;
        }
        return response.text();
    } catch (error) {

        console.log(`error fetching url: ${error}`);
        return null;
    }
}

export const pause = (ms: number) => new Promise(res => setTimeout(res, ms));