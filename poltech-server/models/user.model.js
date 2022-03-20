'use strict';
const jwt = require('jsonwebtoken');
const { TE, to } = require('../services/util.service');
const CONFIG = require('config');
const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	first: { type: String, required: [true, 'First name is required'] },
	last: { type: String, required: [true, 'Last name is required'] },
	email: { type: String, allowNull: true, required: [true, 'Email is required'] },
	phone: { type: String, allowNull: true },
	password: { type: String, allowNull: true, required: [true, 'Password is required'] },
	role: { type: String, enum: ['businessuser', 'admin', 'user'], default: "user" },
}, { timestamps: true })

userSchema.pre('save', async function (error, doc, next) {
	let err, user;
	[err, user] = await to(mongoose.models["User"].find({ email: this.email }));
	if (user && user.length > 0 && !user[0]._id.equals(this._id)) {
		TE("Email is already used", true);
	}
	doc.role = "user";
	next();
});

userSchema.methods.comparePassword = async function (pw) {
	let err, pass
	if (!this.password) TE('password not set');

	pass = (pw === this.password);

	if (!pass) TE('invalid password');

	return this;
};

userSchema.methods.getJWT = function () {
	let expiration_time = parseInt(CONFIG.get("jwt").expiration);
	return "Bearer " + jwt.sign({ user_id: this._id }, CONFIG.get("jwt").secretKey, { expiresIn: expiration_time });
};

const User = mongoose.model('User', userSchema);
module.exports = User;