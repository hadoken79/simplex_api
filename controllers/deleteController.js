const
    simplexService = require('../services/simplexService'),
    storageService = require('../services/storageService');



const renderDelete = (req, res) => {


    res.render('archive', {
        title: 'Simplex-Api',
        heading: 'Hier kannst Projekte auf Simplex anzeigen oder herunterladen.',
        archiveActive: true,
        info: 'Status'
    });

}

const prepareDeleting = (req, res) => {


    let maxDate = new Date().toISOString(); //fallback
    let pickerVal = 'Kein Datum gewählt.';
    let dlEnable = false;
    let folders = storageService.getFolders('storage');//muss über Docker, oder wenn nativ verwendet, über OS auf eine externe HDD gelinkt werden.

    if (req.query.maxDate) {
        maxDate = req.query.maxDate + 'T12:00:00.000Z';
        pickerVal = maxDate.slice(0, -14);
        dlEnable = true;
    }

    simplexService.getAllProjects(maxDate, 200, 0)
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
                info: 'Auszug der Projekte (Seite 1)',
                projects: projects.totalElements
            });
        });

}

const startDeleting = (req, res) => {

    //console.log('Selected Folder = ' + req.query.folder);

    let folder = req.query.folder;
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
        });
}