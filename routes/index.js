const
    router = require('express').Router(),
    homeController = require('../controllers/homeController');

router.get('/home', homeController.renderHome);
router.get('/', homeController.renderHome);

module.exports = router;