const cheerio = require("cheerio");
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");

puppeteer.use(pluginStealth());

var browser;

(async () => {
    browser = await puppeteer.launch({ headless: false, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", });
})();

exports.listCards = async (request) => {
    try {
        const url = request.body?.url;
        const password = request.body?.password;
        const username = request.body?.username;

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(url, { waitUntil: "domcontentloaded" });

        if (password && username) {
            await page.click("#login-button > div > div")

            const inputUsername = await page.waitForSelector("#email");
            const inputPassword = await page.waitForSelector("#password");
            await inputUsername.type(username, { delay: 5 });
            await inputPassword.type(password, { delay: 5 });

            const button = await page.$$("#login-button");
            await button[1].click();
        }

        await page.waitForSelector(".multi-cards");

        const html = await page.content();
        const $ = cheerio.load(html);

        const divList = $(".smart-card-row");

        console.log(divList.length)

        const deck = {};

        const _nameDeck = await page.waitForSelector(".deck-name");
        const nameDeck = await _nameDeck.evaluate((i) => i.textContent);

        deck[nameDeck] = {
            flashCards: []
        }

        const list = deck[nameDeck].flashCards;

        page.close();

        for (const element of divList) {
            const pergunta = $(element).find("div:nth-child(2) > div:nth-child(1) > div > div > div > div:nth-child(1)").find("p").text();
            const resposta = $(element).find("div:nth-child(2) > div:nth-child(2) > div > div > div > div p").text();
            const imagem = $(element).find("div:nth-child(2) figure img")?.attr("src");
            const obj = {
                question: pergunta,
                answer: resposta,
                medias: imagem ? [imagem] : []
            };
            console.log(obj);
            if (pergunta !== "" && !list.find((e) => e.question === pergunta)) {
                list.push(obj);
            };
        }

        console.log(deck[nameDeck].flashCards.length)
        return deck;
    } catch (err) {
        console.log(err);
        request.json({ status: 500, message: err.message });
    }
}