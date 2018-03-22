'use strict'

var express = require('express')
var db = require('../db')
var helpers = require('./helpers')

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'view')
  .use(express.static('static'))
  .use('/image', express.static('db/image'))
  // TODO: Serve the images in `db/image` on `/image`.
  .get('/', all)
  /* TODO: Other HTTP methods. */
  // .post('/', add)
  .get('/:id', get)
  // .put('/:id', set)
  // .patch('/:id', change)
  .delete('/:id', remove)
  .listen(1902)

function all(req, res) {

    var result = {errors: [], data: db.all()}

    res.format({
      json: () => res.json(result),
      html: () => res.render('list.ejs', Object.assign({}, result, helpers))
    })

}

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
