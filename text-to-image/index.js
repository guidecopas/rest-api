const cheerio = require("cheerio");
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const { uploadFileToImgur } = require("./imageToUrl.js");
puppeteer.use(pluginStealth());
const fs = require("fs");

const url = `https://onlinetexttools.com/convert-text-to-image"`;

const configValues = async (page) => {

    // Use o seletor CSS para localizar o elemento desejado
    const html = await page.content();
    const $ = cheerio.load(html);

    const element = $("#siteinfo > div.page-content > div.page.container > div.content > div:nth-child(4) > div > div.body > div.sides-options-wrapper > div > div:nth-child(1) > div:nth-child(2)");
    const input = element.children().next().toString()
    const id = input.match(/option-background-color-([a-zA-Z-0-9]+)/)[1];

    const colorSelector = await page.$(`#option-background-color-${id}`);
    await page.evaluate((element) => element.value = '', colorSelector);

    const widthSelector = await page.$(`#option-width-${id}`);
    await widthSelector.type("480");

    const heightSelector = await page.$(`#option-height-${id}`);
    await heightSelector.type("480");

    const sizeSelector = await page.$(`#option-font-size-${id}`);
    await page.evaluate((element) => element.value = '32px', sizeSelector);

    const paddingSelector = await page.$(`#option-padding-${id}`);
    await paddingSelector.type("10");

    const distanteBetweenSelector = await page.$(`#option-line-height-${id}`);
    await distanteBetweenSelector.type("35");

    const selectHSelector = await page.$(`#option-align-horizontal-${id}`);
    await selectHSelector.select("center");

    const selectVSelector = await page.$(`#option-align-vertical-${id}`);
    await selectVSelector.select("middle");

    const boldLabelSelector = await page.$(`#siteinfo > div.page-content > div.page.container > div.content > div:nth-child(4) > div > div.body > div.sides-options-wrapper > div > div:nth-child(3) > div:nth-child(2) > label`);
    await boldLabelSelector.click();
}

var browser;

(async () => {
    browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // Necessário ter o chrome instalado (Esse é o caminho padrão).
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await configValues(page);
})();

// https://onlinetexttools.com/convert-text-to-image
//

exports.textToImage = async (text) => {
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded" });
        const textAreaSelector = "#siteinfo > div.page-content > div.page.container > div.content > div:nth-child(4) > div > div.body > div.sides-wrapper.clearfix > div.side.input > div > div.side-wrapper > div.data-wrapper > textarea";
        await page.evaluate((element) => element.value = '', textAreaSelector);
        await page.type(textAreaSelector, text, { delay: 5 });
        const chainWithSeletor = "#siteinfo > div.page-content > div.page.container > div.content > div:nth-child(4) > div > div.body > div.sides-wrapper.clearfix > div.side.output > div > div.side-widgets > div.side-widgets-wrapper > div.widget.widget-chain";
        await page.click(chainWithSeletor);
        await new Promise((resolve) => setTimeout(() => resolve(true), 750));
        await page.waitForSelector("#siteinfo > div.page-content > div.page.container > div.content > div:nth-child(4) > div > div.body > div.sides-wrapper.clearfix > div.side.output.combinator-active > div > div.side-wrapper.immersive > div.tool-combinator > div > div > div:nth-child(1)");
        const base64Selector = await page.$("#siteinfo > div.page-content > div.page.container > div.content > div:nth-child(4) > div > div.body > div.sides-wrapper.clearfix > div.side.output.combinator-active > div > div.side-wrapper.immersive > div.tool-combinator > div > div > div:nth-child(1)");
        await base64Selector.click();
        await new Promise((resolve) => setTimeout(() => resolve(true), 750));
        const textareaElement = await page.$("#siteinfo > div.page-content > div.page.container > div.content > div:nth-child(4) > div.section.sides.tool.tool-chained > div.body > div.sides-wrapper.clearfix > div.side.output > div > div.side-wrapper > div.data-wrapper > textarea");
        const base64 = await page.evaluate((textarea) => textarea.value, textareaElement);
        page.close();
        var buffer = Buffer.from(base64, "base64");
        const filename = `${new Date().getTime()}.png`;
        fs.writeFileSync(`./temp/${filename}`, buffer);
        const link = await uploadFileToImgur(filename);

        return {
            status: 200,
            message: "Sucesso",
            url: link,
            buffer: buffer.toString("base64")
        }

    } catch (err) {
        if (err.toString().match(/Request failed with status code 403/i)) {
            throw {
                status: 200,
                message: "Não consegui a URL, apenas o Base64",
                url: "",
                buffer: buffer.toString("base64")
            }
        }
        throw {
            status: 500,
            message: "Deu erro na criação da imagem"
        }
    }
}