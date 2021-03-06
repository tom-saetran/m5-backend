import fs from "fs-extra"
import path from "path"
import multer from "multer"
import uniqid from "uniqid"
import express from "express"
import createError from "http-errors"
import { validationResult } from "express-validator"
import { blogPostValidation, commentValidation } from "../validation.js"
import { readBlogPosts, writeBlogPosts, writeCover } from "../lib/fs-tools.js"

const blogPostsRouter = express.Router()

blogPostsRouter.post("/", blogPostValidation, async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            const content = await readBlogPosts()
            const entry = { ...req.body, createdAt: new Date(), _id: uniqid(), comments: [], author: { name: "Fake Tom", avatar: "https://via.placeholder.com/200?text=TOM", _id: "FAKEID" } }
            content.push(entry)
            await writeBlogPosts(content)
            res.status(201).send(entry)
        } else {
            next(createError(400, JSON.stringify(errors.errors)))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.get("/", async (req, res, next) => {
    try {
        const content = await readBlogPosts()
        if (req.query.title !== undefined) res.send(content.filter(item => item.title.toLowerCase().includes(req.query.title.toLowerCase())))
        res.send(content)
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.get("/:id", async (req, res, next) => {
    try {
        const content = await readBlogPosts()
        const result = content.find(item => item._id === req.params.id)
        result ? res.send(result) : next(createError(404, `Item with id ${req.params.id} was not found`))
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.put("/:id", blogPostValidation, async (req, res, next) => {
    try {
        const content = await readBlogPosts()
        const result = content.filter(item => item._id !== req.params.id)
        let me = content.find(item => item._id === req.params.id)
        if (!me) next(createError(404, `Item with id ${req.params.id} was not found`))
        else {
            me = { ...me, ...req.body }
            result.push(me)
            const errors = validationResult(result)
            if (!errors.isEmpty()) next(createError(400, JSON.stringify(errors.errors)))
            else {
                writeBlogPosts(result)
                res.send(me)
            }
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.delete("/:id", async (req, res, next) => {
    try {
        const content = await readBlogPosts()
        const result = await content.find(item => item._id === req.params.id)
        if (!result) next(createError(400, "id does not match"))
        else {
            writeBlogPosts(result)
            res.send("Deleted")
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.get("/:id/comments", async (req, res, next) => {
    try {
        const content = await readBlogPosts()
        const result = content.find(item => item._id === req.params.id)
        if (!result) res.status(400).send("id does not match")
        else result ? res.send(result.comments) : next(createError(404, `Item with id ${req.params.id} was not found`))
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.post("/:id/comments", commentValidation, async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            const content = await readBlogPosts()
            const result = content.filter(item => item._id !== req.params.id)
            let me = content.find(item => item._id === req.params.id)
            if (!me) res.status(400).send("id does not match")
            const entry = { ...req.body, createdAt: new Date(), _id: uniqid() }
            me.comments.push(entry)
            result.push(me)
            await writeBlogPosts(result)
            res.status(201).send(entry)
        } else {
            next(createError(400, JSON.stringify(errors.errors)))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.put("/:id/comments/:cid", commentValidation, async (req, res, next) => {
    try {
        const content = await readBlogPosts()
        const result = content.filter(item => item._id !== req.params.id)
        let me = content.find(item => item._id === req.params.id)
        if (!me) next(createError(400, "blog post id does not match"))

        let comment = me.comments.find(item => item._id === req.params.cid)
        if (!comment) next(createError(400, "comment id does not match"))
        else {
            comment = { ...comment, ...req.body }
            const errors = validationResult(comment)
            if (errors.isEmpty()) {
                me.comments.push(comment)
                result.push(me)
                await writeBlogPosts(result)
                res.send("Edited!")
            } else {
                next(createError(400, JSON.stringify(errors.errors)))
            }
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.delete("/:id/comments/:cid", async (req, res, next) => {
    try {
        const content = await readBlogPosts()
        let result = content.filter(item => item._id !== req.params.id)
        let me = content.find(item => item._id === req.params.id)
        if (!me) res.status(400).send("blog post id does not match")
        else {
            let comment = me.comments.find(item => item._id === req.params.cid)
            if (!comment) res.status(400).send("comment id does not match")
            else {
                let remaining = me.comments.filter(item => item._id !== req.params.cid)
                me.comments = remaining
                result.push(me)
                await writeBlogPosts(result)
                res.send("Deleted")
            }
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.post("/:id/uploadCover", multer().single("cover"), async (req, res, next) => {
    try {
        if (!req.file) next(createError(400, "Image is missing"))
        else {
            const content = await readBlogPosts()
            const result = content.filter(item => item._id !== req.params.id)
            let me = content.find(item => item._id === req.params.id)
            if (!me) next(createError(400, "id does not match"))
            else {
                await writeCover(req.file.buffer, req.params.id + path.extname(req.file.originalname))
                me = { ...me, cover: `${req.protocol}://${req.get("host")}/img/covers/${req.params.id}${path.extname(req.file.originalname)}` }
                result.push(me)
                writeBlogPosts(result)
                res.status(201).send("Added")
            }
        }
    } catch (error) {
        next(error)
    }
})

export default blogPostsRouter
