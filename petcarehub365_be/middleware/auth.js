const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const config = require('../config/config');
const {
    User,
    Session,
    Role,
    InvalidatedToken,
} = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../constants/tokens');
const { getBearerToken, hashToken } = require('../utils/token.util');

const auth = (optional = false) => async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            if (optional) {
                return next();
            }
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
        }
        const token = getBearerToken(req);
        const tokenHash = hashToken(token);
        const invalidatedToken = await InvalidatedToken.findOne({ token_hash: tokenHash });
        if (invalidatedToken) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Token has been invalidated');
        }

        const payload = jwt.verify(token, config.jwt.secret);
        if (payload.type !== tokenTypes.ACCESS) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
        }

        if (payload.sid) {
            const session = await Session.findById(payload.sid);
            if (!session || session.is_revoked) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Session revoked or invalid');
            }
            if (session.expires_at < new Date()) {
                throw new ApiError(httpStatus.UNAUTHORIZED, 'Session expired');
            }
            req.sessionId = payload.sid;
        }

        const user = await User.findById(payload.sub).populate('global_role_ids');
        if (!user) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
        }
        if (user.status !== 'ACTIVE') {
            throw new ApiError(httpStatus.FORBIDDEN, 'Your account is not active');
        }
        if (user.isPasswordChangedAfter(payload.iat)) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Password recently changed. Please login again.');
        }

        req.user = user;
        req.sessionId = payload.sid;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            next(new ApiError(httpStatus.UNAUTHORIZED, 'Token expired'));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'));
        } else {
            next(error instanceof ApiError ? error : new ApiError(httpStatus.UNAUTHORIZED, error.message || 'Please authenticate'));
        }
    }
};

const getUserRoleSlugs = (user) => {
    const roles = new Set();

    const directRole = String(user?.role || '').trim().toLowerCase();
    if (directRole) roles.add(directRole);

    (user?.global_role_ids || []).forEach((roleLike) => {
        if (!roleLike) return;
        if (typeof roleLike === 'string') {
            roles.add(roleLike.trim().toLowerCase());
            return;
        }
        const slug = String(roleLike.slug || roleLike.name || roleLike.code || '').trim().toLowerCase();
        if (slug) roles.add(slug);
    });

    return Array.from(roles);
};

const denyRoles = (disallowedRoles = [], message = 'Forbidden') => (req, res, next) => {
    const blockedRoles = new Set(
        (disallowedRoles || []).map((role) => String(role || '').trim().toLowerCase()).filter(Boolean)
    );
    const userRoles = getUserRoleSlugs(req.user);

    if (userRoles.some((role) => blockedRoles.has(role))) {
        return next(new ApiError(httpStatus.FORBIDDEN, message));
    }

    return next();
};

module.exports = {
    auth,
    denyRoles,
};
