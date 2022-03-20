const { User } = require('../models');
const validator = require('validator');
const { to, TE } = require('../services/util.service');

const getUniqueKeyFromBody = function (body) {
	let unique_key = body.unique_key;
	if (typeof unique_key === 'undefined') {
		if (typeof body.email != 'undefined') {
			unique_key = body.email
		} else if (typeof body.phone != 'undefined') {
			unique_key = body.phone
		} else {
			unique_key = null;
		}
	}

	return unique_key;
}
module.exports.getUniqueKeyFromBody = getUniqueKeyFromBody;

const createUser = async function (userInfo) {
	let unique_key, auth_info, err, user;

	auth_info = {}
	auth_info.status = 'create';

	unique_key = getUniqueKeyFromBody(userInfo);
	if (!unique_key) TE('An email or phone number was not entered.');

	if (validator.isEmail(unique_key)) {
		auth_info.method = 'email';
		userInfo.email = unique_key;
		[err, user] = await to(User.create(userInfo));
		if (err) TE('Email id is already registered');

		return user;

	} else if (validator.isMobilePhone(unique_key, 'any')) {
		auth_info.method = 'phone';
		userInfo.phone = unique_key;
		[err, user] = await to(User.create(userInfo));

		if (err) TE('user already exists with that phone number');

		return user;
	} else {
		TE('A valid email or phone number was not entered.');
	}
}
module.exports.createUser = createUser;

const authUser = async function (userInfo) {
	let unique_key;
	let auth_info = {};
	auth_info.status = 'login';
	unique_key = getUniqueKeyFromBody(userInfo);

	if (!unique_key) TE('Please enter an email or phone number to login');


	if (!userInfo.password) TE('Please enter a password to login');

	let user;
	if (validator.isEmail(unique_key)) {
		auth_info.method = 'email';

		[err, user] = await to(User.findOne({ email: unique_key, blocked: false }));
		console.log(err, user, unique_key);
		if (err) TE(err.message);

	} else if (validator.isMobilePhone(unique_key, 'any')) {
		auth_info.method = 'phone';

		[err, user] = await to(User.findOne({ phone: unique_key, blocked: false }));
		if (err) TE(err.message);

	} else {
		TE('A valid email or phone number was not entered');
	}

	if (!user) TE('User not registered');

	[err, user] = await to(user.comparePassword(userInfo.password));

	if (err) TE(err.message);

	return user;

}
module.exports.authUser = authUser;

module.exports.roleAuthorization = function (roles) {
	return function (req, res, next) {
		if (roles.indexOf(req.user.role) > -1 || req.user.role === "superuser" || (req.user.role !== "superuser" && req.user.role === "admin")) {
			return next();
		}

		res.status(401).json({ error: 'You are not authorized to view this content' });
		return next('Unauthorized');
	}

}