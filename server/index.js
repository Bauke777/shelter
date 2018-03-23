'use strict'

var express = require('express')
var db = require('../db')
var helpers = require('./helpers')
var bodyParser = require('body-parser')

module.exports = express()
    .set('view engine', 'ejs')
    .set('views', 'view')
    .use(express.static('static'))
    .use('/image', express.static('db/image'))
    .use(bodyParser.urlencoded({
        extended: false
    }))
    .use(bodyParser.json())
    .get('/', all)

    /* Other HTTP methods. */
    .post('/', add)
    .get('/add', form) // Render form
    .get('/:id', get) // Get animal's details
    // .put('/:id', set)
    // .patch('/:id', change)
    .delete('/:id', remove) // Remove animal
    .listen(1902)

// Get home page with all animals
function all(req, res) {

    var result = {errors: [], data: db.all()}

    res.format({
        json: () => res.json(result),
        html: () => res.render('list.ejs', Object.assign({}, result, helpers))
    })

}

// Get detail page for specific animal
function get(req, res) {

    var id = req.params.id

    try {
        // If id is availible in the database, render as JSON or HTML
        if (db.has(id)) {
            var result = {errors: [], data: db.get(id)}
            res.format({
                json: () => res.json(result),
                html: () => res.render('detail.ejs', Object.assign({}, result, helpers))
            })
        }
        // If id did exist before but has been removed
        else if (db.removed(id)) {
            var result = {errors: [{id: 410, title: '410', detail: 'Gone'}]}
            res.status(410).render('error.ejs', Object.assign({}, result, helpers))
        }
        // If id is not in the database give
        else {
            var result = {errors: [{id: 404, title: '404', detail: 'Not Found'}]}
            res.status(404).render('error.ejs', Object.assign({}, result, helpers))
        }
    }
    // Handle invalid identifiers like ('/-')
    catch(err) {
        var result = {errors: [{id: 400, title: '400', detail: 'Bad request'}]}
        res.status(400).render('error.ejs', Object.assign({}, result, helpers))
        return
    }

}

// Render form
function form(req, res) {

    res.render('form.ejs')

}

function add(req, res) {

    console.log(req.body)

    checkForm(req.body)

    res.send('Added ' + req.body.name + 'to the database')

}

function checkForm(form) {

    try {
        form.vaccinated = Boolean(form.vaccinated)
        form.declawed = Boolean(form.declawed)
        form.age = Number(form.age)
        form.weight = Number(form.weight)
    }
    catch(err) {
        var result = {errors: [{id: 422, title: '422', detail: 'Unprocessable Entity'}]}
        res.json(result)
        return
    }

}

// Function for removing animals
function remove(req, res) {

    var id = req.params.id

    try {
        // If id is availible in the database, render as JSON or HTML
        if (db.has(id)) {
            db.remove(id)
            var result = {errors: [{id: 204, title: '204', detail: 'No content'}]}
            res.json(result)
        } else {
            var result = {errors: [{id: 404, title: '404', detail: 'Not Found'}]}
            res.json(result)
        }
    }
    catch(err) {
        var result = {errors: [{id: 400, title: '400', detail: 'Bad request'}]}
        res.json(result)
        return
    }

}
