import { JSDOM } from "jsdom";
import fetch from "node-fetch";

export function normalizeURL(url: string) {
    const parsedUrl = new URL(url);
    return `${parsedUrl.hostname}${parsedUrl.pathname}`;
}

interface URLInfo {
    url: string;
    links: string[];
}

export function getUrlsFromHtml(url: string, html: string, baseUrl: string) {
    const dom = new JSDOM(html, {
        url: baseUrl
    });

    const { document } = dom.window;

    const title = document.querySelector("head")?.title;

    const linkEls = document.querySelectorAll("a");

    const info: URLInfo = {
        url: normalizeURL(url),
        links: []
    }

    if (!linkEls || linkEls.length == 0) {
        return info;
    }

    info.links = Array.from(linkEls).map(x => x.href);

    return info;
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

/***
 * Crawl runs untill all urls are exhausted/visited and parsed.
 * 
 */
export async function crawl(url: string) {



}

export const pause = (ms: number) => new Promise(res => setTimeout(res, ms));