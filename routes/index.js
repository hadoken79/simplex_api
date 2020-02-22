const
    router = require('express').Router(),
    homeController = require('../controllers/homeController'),
    archiveController = require('../controllers/archiveController'),
    loginController = require('../controllers/loginController'),
    authMiddleware = require('../middleware/authMiddleware'),
    clientController = require('../controllers/clientController'),
    detailsController = require('../controllers/detailsController');

router.get('/home', homeController.renderHome);
router.get('/', homeController.renderHome);
router.get('/details', detailsController.renderDetails);

router.get('/api/allProjects', authMiddleware, clientController.getProjectsFromAllChannels);
router.get('/api/channelProjects', authMiddleware, clientController.getProjectsFromDistinctChannel);

router.get('/archive', authMiddleware, (req, res) => {

    switch (req.query.do) {
        case 'Show':
            console.log('Case Anzeigen');
            archiveController.renderArchiveSearch(req, res);
            break;
        case 'Download':
            console.log('Case Herunterladen');
            archiveController.prepareDownload(req, res);
            break;
        case 'Start':
            console.log('Case beginn');
            archiveController.startDownload(req, res);
            break;
        default:
            console.log('Case Default');
            archiveController.renderArchive(req, res);
            break;
    }

});
//router.post('/archive', authMiddleware, archiveController.renderArchiveSearch);

router.get('/login', loginController.renderLogin);
router.post('/login', loginController.submitLogin);
//------Api Calls von Client-----//


module.exports = router;