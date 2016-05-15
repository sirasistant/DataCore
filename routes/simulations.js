var express = require('express'),
	simulationsController=require('../controllers/simulationsController'),
	router = express.Router();

router.get('/', simulationsController.list);

router.post('/',simulationsController.create);

router.put('/:id',simulationsController.update);

router.delete('/:id',simulationsController.delete);

router.get('/:id', simulationsController.get);

module.exports = router;