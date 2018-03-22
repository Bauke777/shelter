'use strict'

var express = require('express')
var db = require('../db')
var helpers = require('./helpers')
var path = require('path')
var slug = require('slug')
var bodyParser = require('body-parser')

module.exports = express()
.set('view engine', 'ejs')
.set('views', 'view')
.use(express.static('static'))
.use('/image', express.static('db/image'))
.use(bodyParser.urlencoded({extended: true}))
.get('/', all)

.get('/add', renderForm)
.post('/', add)

.delete('/:id', delAnimal)
.get('/:id', get)

/* TODO: Other HTTP methods. */
// .post('/', add)
// .put('/:id', set)
// .patch('/:id', change)
// .devare('/:id', remove)
.listen(1902)

function all(req, res) {
  var result = {
    errors: [],
    data: db.all()
  }
  /* Use the following to support just HTML:  */
  res.render('list.ejs', Object.assign({}, result, helpers))
  /* Support both a request for JSON and a request for HTML  */
  // res.format({
  //   json: () => res.json(result),
  //   html: () => res.render('list.ejs', Object.assign({}, result, helpers))
  // })
}

// Thanks FJvdPol
function errorHandle(statusCode, error, res, err) {
  var result = {
    errors: [{
      id: statusCode.toString(),
      title: error
    }],
    data: undefined
  }
  if (err) {
    result.error.push(err)
  } else {
    err = undefined
  }
  res.format({
    json: () => res.status(statusCode).json(result),
    html: () => res.status(statusCode).render('error.ejs', Object.assign({}, result, helpers))
  })
  return result
}


function get(req, res) {
  var param = req.params.id
  var error
  var has

  try {
    has = db.has(param)
  } catch (err) {
    errorHandle(400, 'Bad request', res)
    return
  }

  if (db.removed(param)) {
    errorHandle(410, 'Gone', res)
  } else if (!has) {
    errorHandle(404, 'Not found', res)
    console.log('Not found')
  } else {
    var animal = {errors: [], data: db.get(param)}
    res.format({
      json: () => res.json(animal),
      html: () => res.render('detail.ejs', Object.assign({}, animal, helpers))
    })
  }
}

function delAnimal(req, res, next) {
  var param = req.params.id
  var removed = db.removed(param)

  if (removed) {
    return next()
  } else {
    errorHandle(204, 'No content', res)
    db.remove(param)
  }
}

function renderForm(req, res) {
  res.render('form.ejs')
}

function add(req, res, next) {
  var newAnimal

  try {
    req.body.field = Boolean(req.body.field)
    req.body.vaccinated = Boolean(req.body.vaccinated)
    req.body.declawed = Boolean(req.body.declawed)

    req.body.age = Number(req.body.age)
    req.body.weight = Number(req.body.weight)

    console.log(req.body)
    newAnimal = db.add(req.body)
  } catch (err) {
    errorHandle(422, 'Unprocessable Entity', res)
    console.log("Database err: ", err)
    return
  }
  //console.log(newAnimal)
  res.redirect('/'+ newAnimal.id)
}
