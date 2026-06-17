const Joi = require('joi');

const register = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        username: Joi.string().optional(),
        full_name: Joi.string().optional(),
    }),
};

const login = {
    body: Joi.object({
        identifier: Joi.string().required(), // email or username
        password: Joi.string().required(),
        rememberMe: Joi.boolean().optional(),
    }),
};

module.exports = { register, login };
