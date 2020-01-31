const simplexService = require('../services/simplexService');


const renderArchive = (req, res) => {

    simplexService.getAllActiveChannels()
        .then(data => {
            simplexService.getAllProjects(new Date())
                .then(projects => {

                    res.render('archive', {
                        title: 'Simplex-Api',
                        heading: 'Alle gewünschten Projekte',
                        archiveActive: true,
                        channels: data.content,
                        projects: projects
                    });

                })
        });


}

module.exports = {
    renderArchive
}

