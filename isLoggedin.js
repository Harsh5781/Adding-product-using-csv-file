module.exports = function (req, res ,next)
{
    if(!req.isAuthenticated())
    {
        req.session.url = req.originalUrl
        return res.redirect('/login')
    }
    else{
        next()
    }
}