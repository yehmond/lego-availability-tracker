const axios = require("axios");
const cheerio = require("cheerio");
const nodemailer = require('nodemailer');
const BASE_URL = "https://www.lego.com/en-ca/product/";
require("dotenv").config();

const ids = [
    75244, // Tantive IV
    75192, // UCS Millenium Falcon
    75252, // UCS Imperial Star Destroyer
    75252, // UCS Super Star Destroyer
    75102, // X-wing
]

async function getLegoInfo(id) {
    const link = BASE_URL + id;
    const { data } = await axios.get(link);
    const $ = cheerio.load(data);
    const product = $("h1[data-test=product-overview-name]").text();
    const availability = $("p[data-test=product-overview-availability]").text();
    const price = $("span[data-test=product-price]").text().replace("Price", "") || "N/A";
    const productFlag = $("span[data-test=product-flag]").text() || "N/A";

    console.log(`${id} (${product})`);
    console.log(`Availability: ${availability}`);
    console.log(`Price: ${price}`);
    console.log(`Product Flag: ${productFlag}`);
    console.log(`Link: ${link}`);
    console.log();
    return { product, availability, price, productFlag, link };
}

async function sendEmail(plainText, html) {
    const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PWRD
        }
    });

    await transporter.sendMail({
        from: `<YOUR_NAME_HERE> <${process.env.EMAIL}>`,
        to: process.env.EMAIL,
        subject: plainText,
        text: plainText,
        html: html + "<br><br><hr> This email is an automated message from lego-availability-tracker"
    });
}

(async () => {
    for (id of ids) {
        try {
            const { product, availability, price, productFlag, link } = await getLegoInfo(id);
            const infoSkeleton = `
            ${id} (${product}) <br>
            Availability: ${availability} <br>
            Price: ${price} <br>
            Product Flag: ${productFlag} <br>
            Link: ${link}
            `;

            if (availability.toLowerCase().includes("available")) {
                const plainText = `✅ ${product} (${id}) is available at ${price}! <br> ${link}`;
                await sendEmail(plainText, infoSkeleton);
            }
            if (availability.toLowerCase().includes("retired")) {
                const plainText = `💩 ${product} (${id}) is retired <br> ${link}`;
                await sendEmail(plainText, infoSkeleton);
            }
            if (productFlag.toLowerCase().includes("retiring")) {
                const plainText = `⚠️  ${product} (${id}) is retiring soon! <br> ${link}`;
                await sendEmail(plainText, infoSkeleton);
            }
        } catch (err) {
            console.error(err);
        }
    }
})();



