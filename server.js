const express = require("express");
const app = express();
const { listCards } = require("./index.js")

app.use(express.json())

app.post('/', (request, response) => {
    listCards(request.body.url, request.body.password)
        .then((cards) => response.json(cards))
        .catch(() => response.json({ status: 404, message: "ERROR" }).status(404))

})

app.listen(4444, () => {
    console.log("Online...");
})