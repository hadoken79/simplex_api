const simplexService = require('../services/simplexService');



const getProjectsFromAllChannels = (req, res) => {

    let maxCreateDate = req.query.maxCreateDate || new Date().toISOString();
    let size = req.query.size;
    let pageNum = req.query.page;
    let sort = req.query.sort;
    let text = req.query.text;
    console.log('TEXT ' + text);


    simplexService.getAllProjects(maxCreateDate, size, pageNum, `createdDate:${sort}`, text)
        .then(projects => {

            res.status(200).send(projects);

        })
        .catch(err => {
            res.send(500).send({});
        })

}

const getProjectsFromDistinctChannel = (req, res) => {

    let channel = req.query.channel;
    let size = req.query.size;
    let pageNum = req.query.page;
    let sort = req.query.sort;


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