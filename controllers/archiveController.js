const simplexService = require('../services/simplexService');


const renderArchive = (req, res) => {

    simplexService.testCall();
    /*
    simplexService.getProjects(/*daten wie Bereich, channel und co*/)
        .then(data => {
        res.render('archive', {
            title: 'Simplex-Api',
            heading: 'Alle gewünschten Projekte',
            archiveActive: true,
        });
    })
        /*


}

module.exports = {
renderArchive
}

