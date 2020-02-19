const simplexService = require('../services/simplexService');

const renderHome = (req, res) => {

    //Der Projektteil wird ev nicht gebraucht, falls die Clientseitige Abfrage klappt.
    let pageNum = req.query.page || 0;
    let sort = req.query.sort || 'desc';

    simplexService.getAllActiveChannels()
        .then(channeldata => {
            simplexService.getAllProjects(new Date().toISOString(), 30, pageNum, `createdDate:${sort}`)
                .then(projects => {

                    res.render('home', {
                        title: 'Simplex-Api',
                        heading: 'Video Projekte auf Simplex',
                        homeActive: true,
                        channels: channeldata.content,
                        projects: projects
                    });
                });
        });
}





module.exports = {
    renderHome
}