import {body} from "express-validator"

export const authorSignUpValidationNoAvatar = [
    body("name").exists().withMessage("Name is missing").isString().withMessage("Name format incorrect").notEmpty().withMessage("Name is empty"),
    body("surname").exists().withMessage("Surname is missing").isString().withMessage("Surname format incorrect").notEmpty().withMessage("Surname is empty"),
    
    body("email").exists().withMessage("Email is missing").normalizeEmail().isEmail().withMessage("Email is incorrect").notEmpty().withMessage("Email is empty"),
    body("dateofbirth").exists().withMessage("Date of birth is missing").isDate().withMessage("Date of birth format incorrect").notEmpty().withMessage("Date of birth is empty"),
]

export const authorValidation = [
    body("name").exists().withMessage("Name is missing").isString().withMessage("Name format incorrect"),
    body("avatar").exists().withMessage("Avatar is missing").isString().withMessage("Avatar format incorrect")
]

export const commentValidation = [
    body("author").exists().withMessage("Author is missing").isString().withMessage("Author format incorrect"),
    body("text").exists().withMessage("Text is missing").isString().withMessage("Text format incorrect")
]

export const blogPostValidation = [
    body("category").exists().withMessage("Category is missing").isString().withMessage("Category format incorrect").notEmpty().withMessage("Category is empty"),
    body("title").exists().withMessage("Title is missing").isString().withMessage("Title format incorrect").notEmpty().withMessage("Title is empty"),
    body("cover").exists().withMessage("Cover is missing").isString().withMessage("Cover format incorrect").notEmpty().withMessage("Cover is empty"),

    body("readTime").exists().withMessage("Read time object is missing").isObject().withMessage("Read time must be an object with the keys [value, unit]").notEmpty().withMessage("Read time is empty"),
    body("readTime.value").exists().withMessage("Read time value is missing").isInt().withMessage("Read time value format incorrect").notEmpty().withMessage("Read time value is empty"),
    body("readTime.unit").exists().withMessage("Read time unit is missing").isString().withMessage("Read time format incorrect").notEmpty().withMessage("Read time unit is empty"),

    body("content").exists().withMessage("Content is missing").isString().withMessage("Content format incorrect").notEmpty().withMessage("Content is empty")
]