import Joi from 'joi';

export const schemas = {
    register: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string()
            .min(8)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
            .required()
            .messages({
                'string.min': 'Password must be at least 8 characters long',
                'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
                'any.required': 'Password is required'
            }),
        businessName: Joi.string().trim().max(100).optional(),
        country: Joi.string().trim().min(2).max(100).required().messages({
            'string.min': 'Country must be at least 2 characters long',
            'any.required': 'Country is required'
        }),
        phone: Joi.string().trim().pattern(/^[\+]?[1-9][\d]{0,15}$/).required().messages({
            'string.pattern.base': 'Please provide a valid phone number',
            'any.required': 'Phone number is required'
        }),
        role: Joi.string().valid('artist', 'shop_owner', 'admin').default('artist')
    }),

    verifySignupOtp: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
            'string.length': 'OTP must be exactly 6 digits',
            'string.pattern.base': 'OTP must contain only numbers'
        })
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    verifyLoginOtp: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
            'string.length': 'OTP must be exactly 6 digits',
            'string.pattern.base': 'OTP must contain only numbers'
        })
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),

    resetPassword: Joi.object({
        email: Joi.string().email().required(),
        newPassword: Joi.string()
            .min(8)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
            .required()
            .messages({
                'string.min': 'Password must be at least 8 characters long',
                'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
            })
    }),

    changePassword: Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string()
            .min(8)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
            .required()
            .messages({
                'string.min': 'Password must be at least 8 characters long',
                'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
            })
    }),

    refresh: Joi.object({
        refreshToken: Joi.string().required()
    }),

    changeProfile: Joi.object({
        userName: Joi.string().trim().max(100).optional(),
        firstName: Joi.string().trim().max(50).optional(),
        lastName: Joi.string().trim().max(50).optional(),
        phone: Joi.string().trim().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional().messages({
            'string.pattern.base': 'Please provide a valid phone number'
        }),
        address: Joi.string().trim().max(500).optional(),
        country: Joi.string().trim().min(2).max(100).optional().messages({
            'string.min': 'Country must be at least 2 characters long'
        }),
        storeName: Joi.string().trim().max(100).optional()
    }),

    deleteAccount: Joi.object({
        hard: Joi.boolean().default(false)
    })
};