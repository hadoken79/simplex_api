const
    router = require('express').Router(),
    homeController = require('../controllers/homeController'),
    archiveController = require('../controllers/archiveController'),
    loginController = require('../controllers/loginController'),
    authMiddleware = require('../middleware/authMiddleware');


router.get('/home', homeController.renderHome);
router.get('/', homeController.renderHome);

router.get('/archive', authMiddleware, archiveController.renderArchive);

router.get('/login', loginController.renderLogin);
router.post('/login', loginController.submitLogin);
//------Api Calls von Client-----//


module.exports = router;