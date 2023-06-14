const express = require("express");
const app = express();
const { textToImage } = require("./index.js")

app.use(express.json())

app.post('/', (request, response) => {
    textToImage(request.body.text)
        .then((cards) => response.json(cards))
        .catch((err) => {
            response.json(err).status(err.status)
        });

})

app.listen(4444, () => {
    console.log("Online...");
})