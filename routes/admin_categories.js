const express = require('express');

const router = express.Router();

const Categories = require("../models/category");

router.get("/", (req, res) => {
    
    
    Categories.find((err, categories)=> {
        if(err) return console.log(err);

        res.render("admin/categories", {categories: categories});
    })

});

router.get("/add-category", (req, res) => {

    let title = "";
    
    res.render("admin/add_category", {
        title: title,
    });
});

router.post("/add-category", (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();

    let title = req.body.title;
    let slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
    // if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    let errors = req.validationErrors();

    if (errors) {
        console.log("errorrr reeeeee");
        res.render("admin/add_category", {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Categories.findOne({
            title: title
        }, (err, pageTitle) => {

            Categories.findOne({
                slug: slug
            }, (err, cat) => {

                if (cat) {
                    req.flash('danger', 'Page slug exists, choose another.');
                    res.render('admin/pages', {
                        title: title,
                        slug: slug
                    });
                } else {
                    let cat = new Categories({
                        title: title,
                        slug: slug
                    });

                    cat.save(err => {
                        if (err) {
                            return console.log(err);
                        }

                        req.flash('success', 'Category added');
                        res.redirect('/admin/categories');
                    });
                }

            });
        });
    }
});


router.get('/edit-category/:id', (req, res)=>{

    Categories.findById(req.params.id, (err, cat)=> {
        if(err) return console.log(err);

        res.render('admin/edit_category', {
            title: cat.title,
            id: cat._id
        });
    });
});

// Edit Page

router.post("/edit-category/:id", (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();

    let title = req.body.title;
    let slug = req.body.title.replace(/\s+/g, '-').toLowerCase();

    let id = req.body.id;

    let errors = req.validationErrors();
    if (errors) {
        res.render("admin/edit_category", {
            errors: errors,
            title: title
        });
    } else {

            Categories.findOne({
                title: title,
                _id: {'$ne':id}
            }, (err, cat) => {

                if (cat) {
                    req.flash('danger', 'Category exists, choose another.');
                    res.render('admin/edit_category', {
                        title: title,
                        id:id
                    });
                } else {

                    Categories.findById(id, (err, cat)=> {

                        if(err) return console.log(err);
            
                        cat.title = title;
                        cat.slug = slug;
                        cat.save(err => {
                            if (err) {
                                return console.log("catn;t save gg ");
                            }
            
                            req.flash('success', 'Category Updated');
                            res.redirect('/admin/categories');
                        });
                    });
  
                }

            });

    }


});

router.get('/delete-category/:id', (req, res)=>{
    Categories.findByIdAndRemove(req.params.id, (err)=> {
        if(err) throw err;

        req.flash('success', 'Category Deleted');
        res.redirect('/admin/categories/');
    });
});


module.exports = router;