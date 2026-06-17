const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    // Convert Mongoose errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(', ');
    }
    // Convert Multer errors
    if (err.name === 'MulterError') {
        statusCode = 400;
        err.isOperational = true;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'Kích thước ảnh quá lớn. Tối đa cho phép là 5MB.';
        } else {
            message = err.message;
        }
    }
    if (err.message && err.message.includes('image formats are accepted')) {
        statusCode = 400;
        err.isOperational = true;
        message = err.message;
    }
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {}).join(', ');
        message = `Duplicate value for: ${field}`;
    }
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if (!err.isOperational) {
        statusCode = statusCode || 500;
        message = statusCode === 500 ? 'Internal Server Error' : message;
    }

    const response = {
        success: false,
        error: {
            code: statusCode,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    };

    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }

    res.status(statusCode).send(response);
};

module.exports = errorHandler;
