const
    simplexService = require('../services/simplexService'),
    storageService = require('../services/storageService');



const renderArchive = (req, res) => {


    res.render('archive', {
        title: 'Simplex-Api',
        heading: 'Hier kannst Projekte auf Simplex anzeigen oder herunterladen.',
        archiveActive: true,
        info: 'Status'
    });

}

const renderArchiveSearch = (req, res) => {


    let maxDate = new Date().toISOString(); //fallback


    if (req.query.maxDate) {
        maxDate = req.query.maxDate + 'T12:00:00.000Z';
    }
    let pickerVal = maxDate.slice(0, -14);

    //console.log(maxDate);

    simplexService.getAllProjects(maxDate, 200, 0)
        .then(projects => {

            res.render('archive', {
                title: 'Simplex-Api',
                heading: 'Alle gewünschten Projekte',
                archiveActive: true,
                projects: projects,
                info: 'Auszug der Projekte (Seite 1)',
                pickerVal
            });

        })
}

const prepareDownload = (req, res) => {


    let maxDate = new Date().toISOString(); //fallback
    let pickerVal = 'Kein Datum gewählt.';
    let dlEnable = false;
    let folders = storageService.getFolders('storage');//muss über Docker, oder wenn nativ verwendet, über OS auf eine externe HDD gelinkt werden.
    let singleProjectId = '';

    if (req.query.maxDate) {
        maxDate = req.query.maxDate + 'T12:00:00.000Z';
        pickerVal = maxDate.slice(0, -14);
        dlEnable = true;
    }

    if (req.query.singleProjectId) {
        dlEnable = true;
        singleProjectId = req.query.singleProjectId;
        simplexService.getProjectData(singleProjectId)
            .then(project => {
                res.render('archive', {
                    title: 'Simplex-Api',
                    heading: 'Projekt lokal speichern',
                    modalHeading: 'Bitte überprüfen!',
                    archiveActive: true,
                    modal: true,
                    singleProjectId,
                    folders,
                    dlEnable,
                    info: 'Auszug der Projekte (Seite 1)'
                });
            })
            .catch(fail => {
                res.render('login', {
                    title: 'Simplex-Api',
                    heading: fail,
                    loginActive: false,
                    loginFailed: req.body.loginFailed
                });
            })
        return;
    }

    simplexService.getAllProjects(maxDate, 200, 0)
        .then(projects => {
            //User muss über Modal erst noch einige Angaben machen.
            res.render('archive', {
                title: 'Simplex-Api',
                heading: 'Projekte lokal speichern',
                modalHeading: 'Bitte überprüfen!',
                archiveActive: true,
                modal: true,
                pickerVal,
                folders,
                dlEnable,
                info: 'Auszug der Projekte (Seite 1)',
                projects: projects.totalElements
            });
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

const startDownload = (req, res) => {
    let folder = req.query.folder;
    //console.log('Selected Folder = ' + req.query.folder);
    console.log(req.query);
    if (req.query.singleProjectId) {

        simplexService.downloadSingleProject(req.query.singleProjectId, folder)
            .then(response => {
                //platzhalter
                res.render('archive', {
                    title: 'Simplex-Api',
                    heading: 'Projekt runterladen',
                    info: 'Download begonnen',
                    archiveActive: true
                });
            })
            .catch(err => {
                res.status(500).send(err);
            })
        return;
    }


    let maxDate = req.query.maxDate + 'T12:00:00.000Z';



    simplexService.downloadAllData(maxDate, folder)
        .then(response => {
            //platzhalter
            res.render('archive', {
                title: 'Simplex-Api',
                heading: 'Projekte runterladen',
                info: 'Download begonnen',
                archiveActive: true
            });
        })
        .catch(err => {
            res.status(500).send(err);
        })
}

module.exports = {
    renderArchive,
    renderArchiveSearch,
    prepareDownload,
    startDownload
}

