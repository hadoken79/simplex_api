const
    router = require('express').Router(),
    homeController = require('../controllers/homeController'),
    archiveController = require('../controllers/archiveController');


router.get('/home', homeController.renderHome);
router.get('/', homeController.renderHome);

router.get('/archive', archiveController.renderArchive);
//------Api Calls von Client-----//


module.exports = router;