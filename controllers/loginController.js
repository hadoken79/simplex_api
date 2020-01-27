const tokenService = require('../services/tokenService');

const renderLogin = (req, res) => {

    res.render('login', {
        title: 'Simplex-Api',
        heading: 'Melde dich bei Simplex an.',
        loginActive: true,
        loginFailed: req.body.loginFailed
    });
}


const submitLogin = (req, res) => {

    tokenService.getAccessToken(req.body.username, req.body.password)
        .then(loginSucess => {
            if (loginSucess) {
                req.session.isLoggedIn = true;
                res.redirect('/home');
            } else {
                req.body.loginFailed = true;
                renderLogin(req, res);
            }
        })

}

module.exports = {
    renderLogin,
    submitLogin
}