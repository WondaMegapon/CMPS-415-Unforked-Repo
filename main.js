// Package Management~
const express = require('express') // Rendering our material.
const { MongoClient } = require('mongodb') // Accessing our database.
const cookieParser = require('cookie-parser') // Grabbing and handling cookies.
const path = require('path') // Bluuuuh. Why do I need this stuff?
const { render } = require('ejs')
require('dotenv').config() // Our environment variables.

const app = express() // Our app~
app.engine('ejs', require('ejs').__express) // https://github.com/expressjs/express/blob/master/examples/ejs/index.js
app.use(cookieParser()) // Implementing middleware. Letting us read cookies.
app.use(express.json()) // Body Parser isn't real anymore.
app.use(express.urlencoded({ "extended": true })) // It can't hurt you.
app.use(express.static("public")) // https://stackoverflow.com/questions/38757235/express-how-to-send-html-together-with-css-using-sendfile
app.set('views', path.join(__dirname,'pages')) // Specifying where pages are located.
app.set('view engine', 'ejs') // For handling templates.
app.listen(3000, function() {console.log('Server started.')}) // And our listener.

// Any big variables we need.
const mongo_uri = process.env.MONGO_URI // Our URI for the database.
const mongo_db = process.env.MONGO_DB // The exact DB we're going for.
const mongo_collection_user = process.env.MONGO_COLLECTION_USER // The collection who's reading this. [T1]

// Routes!
app.get('/', function(req, res) {
    res.render('index') // Very simple.
})

// Handling registering new users. [T2]
app.post('/user/register', function(req, res) {
    // Hey, we need both of these data values before we do anything else.
    if(req.body.dusername && req.body.dpassword) {
        const client = new MongoClient(mongo_uri) // Creating a new client.
        async function run() {
            try {
                // Creating our data.
                const data = {
                    "username": req.body.dusername,
                    "password": req.body.dpassword
                }
                const part = await client.db(mongo_db).collection(mongo_collection_user).insertOne(data) // Inserting.
                res.render('success', {reason: `User created!`, data: JSON.stringify(part)}) // Rendering our data.
            } finally {
                await client.close() // Closing our connection
            }
        }
        run().catch(console.dir) // Running our async functions.
    } else {
        res.status(404).render('404', {reason: "Invalid form request."}) // Oopsies!
    }
})

// Handling logging in existing users. [T2]
app.post('/user/login', function(req, res) {
    // Hey, we need both of these data values before we do anything else.
    if(req.body.username && req.body.password) {
        const client = new MongoClient(mongo_uri) // Creating a new client.
        async function run() {
            try {
                // Creating our data.
                const data = {
                    "username": req.body.username,
                    "password": req.body.password
                }
                const part = await client.db(mongo_db).collection(mongo_collection_user).findOne(data) // Inserting.
                // Did you notice how much of this was just reused?
                if(part) { // [T3.1]
                    res.cookie('auth', 'authorized', {maxAge: 60000}) // Quick cookie.
                    res.render('success', {reason: `Logged in! Granting cookie.`}) // Rendering our data.
                } else // [T3.2]
                    res.render('404', {reason: `Invalid login.`, title: `Try Again!`}) // Yea, our invalid page.
            } finally {
                await client.close() // Closing our connection
            }
        }
        run().catch(console.dir) // Running our async functions.
    } else {
        res.status(404).render('404', {reason: "Invalid form request."}) // Oopsies!
    }
})

// [T4]
app.get('/cookies', function(req, res) {
    res.render('cookie', {data: JSON.stringify(req.cookies)}) // Just rendering a page.
})

// [T5]
app.get('/cookies/clear', function(req, res) {
    res.clearCookie('auth') // Clearing our cookies.
    res.render('success', {reason: "Cookies successfully cleared."}) // Yea more rendering.
})

// Allegedly this is for handling 404's, but I can't figure it out. :P
app.get('*', function(req, res) {
    res.status(404).render('404')
})