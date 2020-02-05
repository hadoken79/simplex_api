const
    simplexService = require('../services/simplexService'),
    storageService = require('../services/storageService');



const renderArchive = (req, res) => {


    res.render('archive', {
        title: 'Simplex-Api',
        heading: 'Hier kannst Du die auf Simplex liegenden Projekte anzeigen lassen',
        archiveActive: true,
    });

}

const renderArchiveSearch = (req, res) => {


    let maxDate = new Date().toISOString(); //fallback


    if (req.query.maxDate) {
        maxDate = req.query.maxDate + 'T12:00:00.000Z';
    }
    let pickerVal = maxDate.slice(0, -14);

    console.log(maxDate);

    simplexService.getAllProjects(maxDate, 0)
        .then(projects => {

            res.render('archive', {
                title: 'Simplex-Api',
                heading: 'Alle gewünschten Projekte',
                archiveActive: true,
                projects: projects,
                pickerVal
            });

        })
}

const prepareDownload = (req, res) => {


    let maxDate = new Date().toISOString(); //fallback
    let pickerVal = 'Kein Datum gewählt.';
    let dlEnable = false;
    let folders = storageService.getFolders('storage');//muss über Docker, oder wenn nativ verwendet, über OS auf eine externe HDD gelinkt werden.

    if (req.query.maxDate) {
        maxDate = req.query.maxDate + 'T12:00:00.000Z';
        pickerVal = maxDate.slice(0, -14);
        dlEnable = true;
    }

    simplexService.getAllProjects(maxDate, 0)
        .then(projects => {
            //User muss über Modal erst noch einige Angaben machen.
            res.render('archive', {
                title: 'Simplex-Api',
                heading: 'Projekte runterladen',
                modalHeading: 'Bitte überprüfen!',
                archiveActive: true,
                modal: true,
                pickerVal,
                folders,
                dlEnable,
                projects: projects.totalElements
            });
        });

}

const startDownload = (req, res) => {

    //console.log('Selected Folder = ' + req.query.folder);

    let workFolder = req.query.folder;
    let maxDate = req.query.maxDate + 'T12:00:00.000Z';


    simplexService.downloadAllData(maxDate, workFolder)
        .then(response => {

            //platzhalter
            res.render('archive', {
                title: 'Simplex-Api',
                heading: 'Alle gewünschten Projekte',
                archiveActive: true
            });
        });
}

module.exports = {
    renderArchive,
    renderArchiveSearch,
    prepareDownload,
    startDownload
}

