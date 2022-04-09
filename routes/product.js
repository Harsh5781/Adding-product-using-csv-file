const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
const Product = require('../model/product')
const User = require('../model/user')

const fs = require('fs')
const multer = require('multer')
const path = require('path')
const csv = require('csv-parser')
const directoryPath = path.join(__dirname, 'uploads')

const fileFilter = (req, file, cb) => {
    if (file.mimetype == "file/csv") {
        cb(null, true);
    } else {
        cb(new Error("file type incorrect"), false);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = 'data' + path.extname(file.originalname)
        cb(null, uniqueSuffix)
    }
})

const upload = multer({ storage })

const checkLogin = require('../isLoggedin')
const { resourceLimits } = require('worker_threads')
router.get('/new', checkLogin, (req, res) => {
    res.render('product/new')
})

let a = []
router.route('/')
    .get(async (req, res) => {
        const products = await Product.find()

        res.render('product/home', { products })
    })
    .post(checkLogin, upload.single('file'), async (req, res) => {
        try {
            if (req.user) {
                let productFile
                fs.createReadStream('./uploads/data.csv')
                    .pipe(csv())
                    .on('data', (data) => {
                        a.push(data)
                    })
                    .on('end', async () => {
                        let new_arr = a.map((item) => ({
                            name: item[Object.keys(item)[0]],
                            description: item.description,
                            quantity: item.quantity,
                            price: item.price
                        }))
                        for(let item of new_arr){
                        const product = new Product(item)
                        const user = await User.findById(req.user.id)
                        product.user = user.id
                        await product.save()
                    }
                    res.status(200).redirect(`/product`)
                        a= []

                    })
            }
        }
        catch (e) {
            console.log(e)
            res.status(400).send(e)
        }
    })


router.route('/:id')
    .get(async (req, res) => {
        try {
            const { id } = req.params
            const product = await Product.findById(id).populate('user')
            if (!product) {
                return res.status(404).send('No product found')
            }
            res.render('product/show', { product })
        } catch (error) {
            res.status(400).send(error)
        }
    })
    .put(checkLogin, async (req, res) => {
        const { id } = req.params
        const product = await Product.findByIdAndUpdate(id, req.body)
        if (!product.user.equals(req.user)) {
            return res.redirect(`/product/${id}`)
        }
        res.redirect(`/product/${id}`)
    })
    .delete(checkLogin, async (req, res) => {
        try {
            const { id } = req.params
            const product = await Product.findByIdAndDelete(id)
            if (!product) {
                return res.status(404).redirect('/product')
            }
            res.redirect('/product')
        } catch (error) {
            res.status(400).send(error)
        }
    })

router.get('/:id/edit', checkLogin, async (req, res) => {
    const { id } = req.params
    const product = await Product.findById(id).populate('user')
    if (!product.user.equals(req.user)) {
        return res.redirect(`/product/${id}`)
    }
    res.render('product/edit', { product })
})


module.exports = router