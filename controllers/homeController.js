const simplexService = require('../services/simplexService');

const renderHome = (req, res) => {

    
    let pageNum = req.query.page || 0;
    let sort;

    if(req.query.sort === 'asc'){
        sort = 'asc';
    } else {
        sort = 'desc';
    }


    simplexService.getAllActiveChannels()
        .then(channeldata => {
            simplexService.getAllProjects(new Date().toISOString(), 32, pageNum, `createdDate:${sort}`)
                .then(projects => {
                    res.render('home', {
                        title: 'Simplex-Api',
                        heading: 'Video Projekte auf Simplex',
                        homeActive: true,
                        channels: channeldata.content,
                        projects: projects
                    });
                })
                .catch(err => {
                })
        })
        .catch(fail => {
            res.render('login', {
                title: 'Simplex-Api',
                heading: fail,
                loginActive: false,
                loginFailed: req.body.loginFailed
            });
        })
}





module.exports = {
    renderHome
}