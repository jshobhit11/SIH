var express = require('express');
var router = express.Router();

const passport = require('passport');
require('./../middleware/passport')(passport)

const UserController = require('../controllers/user.controller');
const authService = require('../services/auth.service');

var requireAuth = passport.authenticate('jwt', { session: false });

router.post('/users', UserController.create); //create   
router.get('/users', requireAuth, authService.roleAuthorization(["user"]), UserController.get);  //read
router.put('/users', requireAuth, authService.roleAuthorization(["user"]), UserController.update); //update  
router.post('/users/login', UserController.login);

module.exports = router;
