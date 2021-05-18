import express from "express"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from "uniqid"
import { checkMail } from "../checkEmail.js"

const authorRouter = express.Router()

const filePath = fileURLToPath(import.meta.url)
const folderPath = dirname(filePath)
const jsonPath = join(folderPath, "/authors.json")
const content = JSON.parse(fs.readFileSync(jsonPath))

authorRouter.post("/", (req, res) => {
    if (!checkMail(req.body.email)) {
        console.log(req.body.email)
        const newauthor = { ...req.body, createdAt: new Date(), id: uniqid() }
        content.push(newauthor)
        fs.writeFileSync(jsonPath, JSON.stringify(content))

        res.send(newauthor)
    } else {
        res.send("Email in use!")
    }
})

authorRouter.get("/", (req, res) => {
    console.log(req.headers)
    res.send(content)
})

authorRouter.get("/:id", (req, res) => {
    const result = content.find(author => author.id === req.params.id)
    res.send(result)
})

authorRouter.put("/:id", (req, res) => {
    let _me = []
    let _notMe = []
    content.find(item => (item.id === req.params.id ? _me.push(item) : _notMe.push(item)))
    console.log(_me)

    let filtered = content.filter(author => author.id !== req.params.id)
    let me = content.find(author => author.id === req.params.id)
    me = { ...me, ...req.body }
    filtered.push(me)
    fs.writeFileSync(authorJSONPath, JSON.stringify(filtered))
    res.send(me)
})
authorRouter.delete("/:id", (req, res) => {
    const filtered = content.filter(author => author.id !== req.params.id)
    fs.writeFileSync(authorJSONPath, JSON.stringify(filtered))
    res.send("Deleted")
})

export default authorRouter
