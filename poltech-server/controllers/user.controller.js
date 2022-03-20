const { User } = require('../models');
const authService = require('../services/auth.service');
const { to, ReE, ReS } = require('../services/util.service');
const config = require('config');

const create = async function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	let err;
	const body = req.body;

	if (!body.unique_key && !body.email && !body.phone) {
		return ReE(res, 'Please enter an email to register.');
	} else if (!body.password) {
		return ReE(res, 'Please enter a password to register.');
	} else if (body.password != body.retypedpassword) {
		return ReE(res, 'Password does not match.');
	} else {
		let user;
		[err, user] = await to(authService.createUser(body));
		if (err) {
			return ReE(res, err, 422);
		}
		return ReS(res, { message: 'Successfully created new user.', user: user.toObject(), token: user.getJWT() }, 201);
	}
}
module.exports.create = create;

const get = async function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	let user = req.user;

	return ReS(res, { user: user.toObject() });
}
module.exports.get = get;

const update = async function (req, res) {
	let err, user, data;
	user = req.user;
	data = req.body;
	
	if (data.password) {
		user.password = data.password;
		if (data.password != data.retypedpassword) {
			return ReE(res, new Error('Password does not match.'), 422);
		}
	}

	[err, user] = await to(user.save());
	if (err) {
		return ReE(res, err, 422);
	}
	return ReS(res, { message: 'Updated User: ' + user.email });
}
module.exports.update = update;

const login = async function (req, res) {
	const body = req.body;
	let err, user;

	[err, user] = await to(authService.authUser(body));
	if (err) {
		return ReE(res, err, 422);
	}

	return ReS(res, { token: user.getJWT(), user: user.toObject(), totalTime: config.get("jwt").expiration });
}
module.exports.login = login;

const getUserPublicInfo = async function (userId) {
	let err, user;
	[err, user] = await to(User.findById(userId));
	if (err && !user) {
		throw err;
	}
	return {
		id: user._id,
		_id: user._id,
		first: user.first,
		last: user.last,
		email: user.email,
		createdAt: user.createdAt
	}

}
module.exports.getUserPublicInfo = getUserPublicInfo;

const userProfile = async function (req, res) {
	let user_id, err, user;
	user_id = req.query._id;
	[err, user] = await to(getUserPublicInfo(user_id));
	if (err) {
		return ReE(res, err.message);
	}
	res.setHeader('Content-Type', 'application/json');
	return ReS(res, { user: user });

}
module.exports.userProfile = userProfile;