import { normalizeURL, fetchPage, getUrlsFromHtml, pause } from "./crawl";

async function main() {
    try {

        if (process.argv.length < 3) {
            console.error("Please provide required argument : baseurl");
            process.exit(1)
        }

        const baseUrl = process.argv[2];

        if (!baseUrl) {
            console.error("Invalid base url");
            process.exit(1);
        }

        const urls: string[] = [];
        const info: Record<string, { internalLinksCount: number, extLinksCount: number, visited: number }> = {};
        const start = new Date();
        console.log(`crawling base url...`);

        const html = await fetchPage(baseUrl);

        if (!html) {
            console.log(`No html content found at baseurl ${baseUrl}, exiting...`);
            process.exit(0);
        }

        const { externalLinks, internalLinks, url } = getUrlsFromHtml(baseUrl, html, baseUrl);
        info[url] = {
            visited: 1,
            extLinksCount: externalLinks.length,
            internalLinksCount: internalLinks.length
        };

        urls.push(...internalLinks);

        while (urls.length) {
            const current = urls.pop();
            if (!current) {
                continue;
            }

            const normalizedUrl = normalizeURL(current);

            if (normalizedUrl in info) {
                info[normalizedUrl].visited++;
                continue;
            }

            const html = await fetchPage(current);
            if (!html) {
                console.log(`No html content found at ${current}, moving on.`);
                info[normalizedUrl] = {
                    extLinksCount: 0,
                    internalLinksCount: 0,
                    visited: 1
                };
                continue;
            }

            console.log(`Crawled ${current}, extracting urls..`);
            const meta = getUrlsFromHtml(current, html, baseUrl);

            const { url, externalLinks, internalLinks } = meta;

            info[url] = { visited: 1, extLinksCount: externalLinks.length, internalLinksCount: internalLinks.length };

            urls.push(...internalLinks);

            //artificial delay to not cause spam.
            console.log('drinking coffee...');
            await pause(2500);
        }

        const end = new Date();
        console.log(`Finished crawling ${baseUrl} in ${end.getTime() - start.getTime()}ms`);

        const summary = Object.keys(info).map(x => ({
            url: x,
            ...info[x]
        }));

        console.table(summary);

    } catch (error) {
        console.log(error);
    }
}
main();