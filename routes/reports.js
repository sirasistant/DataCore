var express = require('express'),
    reportsController=require('../controllers/reportsController'),
    router = express.Router();

router.get('/',reportsController.list);

router.post('/',reportsController.create);

router.put('/:id',reportsController.update);

router.delete('/:id',reportsController.delete);

router.get('/:id', reportsController.get);

module.exports = router;