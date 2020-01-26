const simplexService = require('../services/simplexService');


const renderArchive = (req, res) => {


    simplexService.testCall()
        .then((message) => {
            res.send(message);
        })
        .catch(err => {
            //hier kann umgeleitet werden, falls Token tot.
            res.send(err.response);
        })



    /*
    simplexService.getProjects(/*daten wie Bereich, channel und co)
        .then(data => {
        res.render('archive', {
            title: 'Simplex-Api',
            heading: 'Alle gewünschten Projekte',
            archiveActive: true,
        });
    })

    */


}

module.exports = {
    renderArchive
}

