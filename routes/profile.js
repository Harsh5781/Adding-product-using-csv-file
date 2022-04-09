const express = require('express')
const passport = require('passport')
const router = express.Router({mergeParams:true})
const mongoose=require('mongoose')
const User = require('../model/user')

const checkLogin = require('../isLoggedin')
const user = require('../model/user')

router.route('/')
.get(checkLogin,async (req, res)=>{
    const {id}= req.user
    const user =await User.findById(id)
    res.render('profile/home',{user})
})
.put(checkLogin, async (req, res)=>{
    const {oldPass, newPass, confirmPass}= req.body
    if(newPass!==confirmPass){
        return res.redirect('/profile/updatepassword')
    }
    const user = await User.findById(req.user.id)
    user.changePassword(oldPass, newPass, function(e){
        if(e)
        {
            res.status(500).send(e)
        }
        else{
            res.redirect('/profile')
        }
    })
})

router.route('/updatepassword')
.get(checkLogin, async (req, res)=>{
    res.render('profile/changePassword')
})
router.route('/:id')
.put(checkLogin, async(req, res)=>{
    const {id} = req.params
    const {username, firstName,  lastName} = req.body
    const user= await User.findByIdAndUpdate(id, {firstName, lastName, username})
    await user.save()
    res.redirect(`/profile`)
})
.delete(checkLogin,async (req, res)=>{
    try {
        const {id}=req.params
        const user = await User.findByIdAndDelete(id)
        res.redirect('/register')
    } catch (error) {
        res.status(400).send(error)
    }
})
router.get('/:id/edit', checkLogin,async (req, res)=>{
    const {id} = req.params
    const user = await User.findById(id)
    res.render('profile/edit', {user})
})

module.exports = router