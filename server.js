if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}



const express = require('express');
const app = express();
const port = 3000;
const users = []

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const createPassport = require('./passportConfig')
createPassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}


app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})



app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/CSS'))
app.use('/js', express.static(__dirname + 'public/JS'))

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 8)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    }   catch {
        res.redirect('/register')
    }
    console.log(users)
})


app.get('/register', (req, res) => res.render('register.ejs'))
app.post('/register', (req, res) => {
    req.body.email
})
app.listen(port, () => console.log(`Test app listening on port ${port}`));
