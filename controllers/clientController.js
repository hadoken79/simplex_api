const simplexService = require('../services/simplexService');



const getProjectsFromAllChannels = (req, res) => {

    let maxCreateDate = req.query.maxCreateDate || new Date().toISOString();
    let size = req.query.size || 30;
    let pageNum = req.query.page || 0;
    let sort = req.query.sort || 'desc';


    simplexService.getAllProjects(maxCreateDate, size, pageNum, `createdDate:${sort}`)
        .then(projects => {

            res.status(200).send(projects);

        })
        .catch(err => {
            res.send(500).send({});
        })

}

const getProjectsFromDistinctChannel = (req, res) => {

    let channel = req.query.channel || 989;
    let size = req.query.size || 30;
    let pageNum = req.query.page || 0;
    let sort = req.query.sort || 'desc';


    simplexService.getChannelProjects(channel, size, pageNum, `createdDate:${sort}`)
        .then(projects => {

            res.status(200).send(projects);

        })
        .catch(err => {
            res.send(500).send({});
        })

}

module.exports = {
    getProjectsFromAllChannels,
    getProjectsFromDistinctChannel
}