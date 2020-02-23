const simplexService = require('../services/simplexService');


const renderDetails = (req, res) => {

    let projectId = req.query.id;

    simplexService.getProjectData(projectId)
        .then(data => {

            res.render('details', {
                heading: 'Projekt-Details',
                project: data,
                details: JSON.parse(data.details),
            });

        })
        .catch(err => {
            res.sendStatus(500);
        })

}

const updateDetails = (req, res) => {
    console.log(req.body);
  

    let projectId = req.body.projectId;
    let details = {
        "ns_st_ci": req.body.ns_st_ci,
        "ns_st_cl": req.body.ns_st_cl,
        "ns_st_ct": req.body.ns_st_ct,
        "ns_st_stc": req.body.ns_st_stc,
        "ns_st_tpr": req.body.ns_st_tpr,
        "ns_st_tep": req.body.ns_st_tep,
        "ns_st_tdt": req.body.ns_st_tdt,
        "ns_st_ddt": req.body.ns_st_ddt,
        "ns_st_tm": req.body.ns_st_tm,
        "ns_st_st": req.body.ns_st_st,
        "ns_st_pr": req.body.ns_st_pr,
        "ns_st_sn": req.body.ns_st_sn,
        "ns_st_ep": req.body.ns_st_ep
    };
    let data = {
        "title": req.body.title,
        "description": req.body.description,
        "details": JSON.stringify(details)
    };

    simplexService.updateProject(projectId, data)
        .then(response => {
            simplexService.getProjectData(projectId)
                .then(newData => {
                    res.render('details', {
                        heading: 'Projekt-Details',
                        project: newData,
                        details: JSON.parse(newData.details),
                        updated: response.updated,
                        error: response.error
                    });
                })
        })


}

module.exports = {
    renderDetails,
    updateDetails
}

