const cheerio = require("cheerio");
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth()); // Ignorar captchas.

var browser;

(async () => {
    browser = await puppeteer.launch({
        headless: false, // Altere para "true" se deseja que o navegador não abra.
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // Necessário ter o chrome instalado (Esse é o caminho padrão).
    });
})();

exports.listCards = async (url, password) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: "domcontentloaded" });

    if (password) { // Não tive oportunidade de testar, não possuo a senha de nenhum privado.
        const input = await page.waitForSelector("#SetPasswordTarget > div > div.UIContainer > div > div:nth-child(2) > form > label > div > input");
        await input.type(password, { delay: 5 });
        await page.click("#SetPasswordTarget > div > div.UIContainer > div > div:nth-child(2) > form > div > button");
    }

    await page.waitForSelector(".SetPageTerms-term");

    const html = await page.content();
    const $ = cheerio.load(html);

    const divList = $('.SetPageTerm-contentWrapper').find('div');

    const _nameDeck = await page.waitForSelector(".SetPage-titleWrapper");
    const nameDeck = await _nameDeck.evaluate((i) => i.textContent);

    page.close();

    const deck = {};

    deck[nameDeck] = {
        flashCards: []
    }

    const list = deck[nameDeck].flashCards;

    for (const element of divList) {
        const pergunta = $(element).find("div:nth-child(1) > div > a > span").text();
        const resposta = $(element).find("div:nth-child(2) > div > a > span").text();
        const imagem = $(element).find("div:nth-child(2) > div > div > div > img").attr("src");
        const obj = {
            question: pergunta,
            answer: resposta,
            medias: imagem ? ["https://" + imagem.split(/https?:\/\//gi)[2]] : []
        };
        if (pergunta !== "" && !list.find((e) => e.question === pergunta)) {
            list.push(obj);
        };
    }

    return deck;
}