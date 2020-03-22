const
    simplexService = require('../services/simplexService'),
    storageService = require('../services/storageService');



const renderDelete = (req, res) => {
    let folders = storageService.getFolders('storage');//muss über Docker, oder wenn nativ verwendet, über OS auf eine externe HDD gelinkt werden.

    res.render('delete', {
        title: 'Simplex-Api',
        heading: 'Projekte auf Simplex aus Ordner löschen. ',
        deleteActive: true,
        info: 'Status',
        folders
    });

}

const prepareDelete = (req, res) => {

    let delEnable = false;
    let folder = req.body.folder;
    let files;
    if (folder) {
        delEnable = true;
    }
    //console.log(req.body);
    console.log('Selected Folder ' + folder);
    storageService.getDeleteIds(folder)
        .then(ids => {
            console.log(ids);
            files = ids.length;
        })
        .catch(err => {
            delEnable = false;
            files = 0;
            folder = 'Kein gültiges File gefunden';
        })
        .then(() => {
            //User muss über Modal bestätigen
            res.render('delete', {
                title: 'Simplex-Api',
                heading: 'Projekte löschen',
                modalHeading: 'Bitte überprüfen!',
                deleteActive: true,
                modal: true,
                folder,
                files,
                delEnable,
                info: 'Auszug der Projekte'
            });
        })
}

const startDelete = (req, res) => {

    let folder = req.body.selectedFolder;
    //console.log(req.body);

    storageService.getDeleteIds(folder)
        .then(ids => {
            simplexService.deleteAllProjets(ids)
                .then(response => {

                    res.render('delete', {
                        title: 'Simplex-Api',
                        heading: 'Projekte löschen',
                        info: 'Löschen begonnen',
                        deleteActive: true
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
        })
        .catch(err => {
            return false;
        })
}

module.exports = {
    renderDelete,
    prepareDelete,
    startDelete
}