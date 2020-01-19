const
    router = require('express').Router(),
    homeController = require('../controllers/homeController'),
    simplexService = require('../services/simplexService');


router.get('/home', homeController.renderHome);
router.get('/', homeController.renderHome);

router.get('/token', simplexService.getProjectData);
//------Api Calls von Client-----//


module.exports = router;