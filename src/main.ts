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

        const crawled = new Set<string>();
        const urls: string[] = [];
        const info: Record<string, number> = {};
        const normalizedUrl = normalizeURL(baseUrl);

        const start = new Date();
        console.log(`crawling base url...`);

        const html = await fetchPage(baseUrl);

        if (!html) {
            console.log(`No html content found at baseurl ${baseUrl}, exiting...`);
            process.exit(0);
        }

        crawled.add(baseUrl);

        if (!baseUrl.endsWith("/")) {
            crawled.add(`${baseUrl}/`);
        }

        const baseUrlInfo = getUrlsFromHtml(baseUrl, html, baseUrl);

        if (normalizedUrl in info) {
            info[normalizedUrl]++;
        }
        else {
            info[normalizedUrl] = 0;
        }

        const links2Process = baseUrlInfo.links.filter(x => x.startsWith(baseUrl));

        urls.push(...links2Process);

        //infinite loop.
        while (urls.length) {
            const current = urls.pop();
            if (!current) {
                continue;
            }

            if (crawled.has(current)) {
                console.log(`already crawled  ${current}`);
                info[normalizeURL(current)]++;
                continue;
            }

            const html = await fetchPage(current);
            if (!html) {
                console.log(`No html content found at ${current}, moving on.`);
                continue;
            }

            crawled.add(current);
            console.log(`Crawled ${current}, extracting urls..`);

            const meta = getUrlsFromHtml(current, html, baseUrl);

            info[meta.url] = 1;

            const urls2Process = meta.links.filter(x => normalizeURL(x) === normalizedUrl);

            urls.push(...urls2Process);

            //artificial delay to not cause spam.
            console.log('drinking coffee...');
            await pause(2500);
        }

        const end = new Date();

        console.log(`Finished crawling ${baseUrl} in ${end.getTime() - start.getTime()}ms`);

        console.log(`Summary \n`);

        for (let [k, v] of Object.entries(info)) {
            console.log(`Url - ${k} | Visits - ${v}`);
        }

    } catch (error) {
        const e = error as Error;

        if (e.name === "TypeError") {
            console.error("Invalid base url");
            process.exit(1);
        }
    }
}
main();