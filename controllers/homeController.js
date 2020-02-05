const simplexService = require('../services/simplexService');

const renderHome = (req, res) => {

    simplexService.getAllActiveChannels()
        .then(channeldata => {
            simplexService.getAllProjects(new Date().toISOString(), 0)
                .then(projects => {

                    res.render('home', {
                        title: 'Simplex-Api',
                        heading: 'Alle gewünschten Projekte',
                        homeActive: true,
                        channels: channeldata.content,
                        projects: projects
                    });

                })
        });

}

module.exports = {
    renderHome
}