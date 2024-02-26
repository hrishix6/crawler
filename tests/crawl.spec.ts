import { test, expect } from "@playwright/test";
import { normalizeURL, getUrlsFromHtml } from "../src/crawl";


test("normalize url", () => {
    const url = "https://nodejs.org/api/buffer.html";
    const want = "nodejs.org/api/buffer.html";
    const got = normalizeURL(url);
    expect(got).toBe(want);
});


test("extract urls from html", () => {

    const domString = `<html>
    <body>
        <a href="/hello.png"><span>Go to Boot.dev</span></a>
    </body>
</html>
`;

    const got = getUrlsFromHtml("https://blog.boot.dev", domString, "https://blog.boot.dev");
    console.log(got[0]);
    expect(got.links.length).toBe(1);

});
