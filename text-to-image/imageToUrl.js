require("dotenv").config();
const fs = require("fs");
const axios = require("axios");

const IMGUR_ENDPOINT = "https://api.imgur.com/3/image";

const imgurClientId = process.env.CLIENTID_IMGUR; // Crie uma conta e pegue seu "clientId"

exports.uploadFileToImgur = async (filename) => {
    const imageData = fs.readFileSync(`./temp/${filename}`);
    const response = await axios({
        method: 'POST',
        url: IMGUR_ENDPOINT,
        headers: { Authorization: `Client-ID ${imgurClientId}`, 'Content-Type': 'application/json' },
        data: { image: imageData.toString('base64') }
    })
    return response?.data?.data?.link || false;
}