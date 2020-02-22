const simplexService = require('../services/simplexService');


const renderDetails = (req, res) => {

    // let projectId = req.query.id;

    //simplexService.getProjectData(projectId)
    // .then(data => {

    res.render('details', {
        heading: 'Projekt-Details'
    });

    //  })
    //.catch(err => {

    //  res.send(500).send({});
    //})

}

module.exports = {
    renderDetails
}

