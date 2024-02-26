import { JSDOM } from "jsdom";
import fetch from "node-fetch";

export function normalizeURL(url: string) {
    const parsedUrl = new URL(url);
    return `${parsedUrl.hostname}${parsedUrl.pathname}`;
}
export interface URLInfo {
    url: string;
    internalLinks: string[];
    externalLinks: string[];
}
export interface LinksCount {
    internalLinksCount: number;
    extLinksCount: number;
    visited: number;
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

        if (isInternalUrl(link.href, baseUrl)) {
            info.internalLinks.push(link.href);
        }
        else {
            info.externalLinks.push(link.href);
        }
    }


    return info;
}

export function isInternalUrl(url: string, baseUrl: string) {
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

export async function crawl(baseUrl: string, urls: string[], info: Record<string, LinksCount>, delayMs: number) {

    if(urls.length == 0) {
        return info;
    }

    const current = urls.pop();

    if(!current) {
        return await crawl(baseUrl, urls,info,delayMs);
    }

    const normalizedUrl = normalizeURL(current);

    if(normalizedUrl in info){
        info[normalizedUrl].visited++;
        return await crawl(baseUrl, urls,info,delayMs);
    }

    const html = await fetchPage(current);
    if (!html) {
        console.log(`No html content found at ${current}, moving on.`);
        info[normalizedUrl] = {
            extLinksCount: 0,
            internalLinksCount: 0,
            visited: 1
        };
        return await crawl(baseUrl, urls,info,delayMs);
    }
    
    console.log(`Crawled ${current}, extracting urls..`);

    const meta = getUrlsFromHtml(current, html, baseUrl);
    const { url, externalLinks, internalLinks } = meta;
    info[url] = { visited: 1, extLinksCount: externalLinks.length, internalLinksCount: internalLinks.length };

    urls.push(...internalLinks);

    //artificial delay to not cause spam.
    console.log('drinking coffee...');
    await pause(delayMs);
    return await crawl(baseUrl,urls,info,delayMs);
}