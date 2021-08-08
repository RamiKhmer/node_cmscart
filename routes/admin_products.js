const express = require('express');
const router = express.Router();
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const resizeImg = require("resize-img");


const Product = require("../models/product");
const Category = require("../models/category");
const product = require('../models/product');

router.get("/", (req, res) => {

    let count;

    Product.countDocuments((err, c)=> {
        count = c;
    });

    Product.find((err, products)=> {
        res.render('admin/products', {products: products, count:count});
    });

});

router.get("/add-product", (req, res) => {

    let title = "";
    let desc = "";
    let price = "";

    Category.find((err, cats)=> {
        res.render("admin/add_product", {
            title: title,
            desc: desc,
            categories: cats,
            price: price
        });
    });
    
});

router.post('/add-product', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find(function (err, categories) {
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/product_images/' + product._id);

                    mkdirp('public/product_images/' + product._id + '/gallery');

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs');

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;
      
                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }
});

router.post("/reorder-pages", (req, res)=> {
    var ids = req.body.id;
    var count = 0;

    for (let i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function(count){
            Page.findById(id, function(err, page){
                page.sorting = count;
                page.save(function(err){
                    if(err) return console.log(err);
                });
            });
        })(count); 
        
    }
    
});

router.get('/edit-page/:slug', (req, res)=>{
    Page.findOne({slug: req.params.slug}, (err, page)=> {
        if(err) return console.log(err);

        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});

// Edit Page

router.post("/edit-page/:slug", (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    let content = req.body.content;
    let id = req.body.id;

    let errors = req.validationErrors();
    if (errors) {
        res.render("admin/edit_page", {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {

            Page.findOne({
                slug: slug,
                _id: {'$ne':id}
            }, (err, page) => {

                if (page) {
                    req.flash('danger', 'Page slug exists, choose another.');
                    res.render('admin/edit_page', {
                        title: title,
                        slug: slug,
                        content: content,
                        id:id
                    });
                } else {

                    Page.findById(id, (err, page)=> {

                        if(err) return console.log(err);

                        page.title = title;
                        page.slug = slug;
                        page.content = content;

                        page.save(err => {
                            if (err) {
                                return console.log("del del");
                            }

                            req.flash('success', 'Page Updated');
                            res.redirect('/admin/pages/edit-page/'+page.slug);
                        });
                    });
  
             
                }

            });

    }


});

router.get('/delete-page/:id', (req, res)=>{
    Page.findByIdAndRemove(req.params.id, (err)=> {
        if(err) throw err;

        req.flash('success', 'Page Deleted');
        res.redirect('/admin/pages/');
    });
});


module.exports = router;