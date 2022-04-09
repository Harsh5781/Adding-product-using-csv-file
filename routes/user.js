const express = require('express')
const passport = require('passport')
const route = express.Router({mergeParams:true})

const User = require('../model/user')

route.get('/register', (req, res)=>{
    res.render('user/register')
})
route.post('/register',  async(req, res, next)=>{
    try{
        const {username, password, firstName, lastName} = req.body
        const user = new User({firstName, lastName,  username})
        const newUser = await User.register(user, password)
        req.login(newUser, (e)=>{
            if(e){
                next(e)
            }
            else{
                const url = req.session.url || '/product'
                res.redirect(url)
            }
        })
    }
    catch(e){
        res.redirect('/register')
    }
})

route.get('/login', (req, res)=>{
    res.render('user/login')
})
route.post('/login', passport.authenticate('local', { failureRedirect: '/login'}),async (req, res)=>{
    const url = req.session.url || '/product'
    res.redirect(url)
})
route.get('/logout', (req, res)=>{
    req.logOut()
    res.redirect('/product')
})
 
module.exports = route