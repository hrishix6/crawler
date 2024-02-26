import { url } from "inspector";
import { normalizeURL, fetchPage, getUrlsFromHtml, pause, LinksCount, crawl } from "./crawl";

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
        urls.push(baseUrl);
        
        await crawl(baseUrl,urls,info,1500);

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