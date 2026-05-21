const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { User, Session, InvalidatedToken, PasswordResetToken } = require('../models');
const config = require('../config/config');
const { tokenTypes } = require('../constants/tokens');
const { getBearerToken, invalidateAccessToken } = require('../utils/token.util');

// Helper: Generate JWT
const generateTokens = (userId, sessionId) => {
    const accessPayload = { sub: userId, type: tokenTypes.ACCESS, sid: sessionId };
    const refreshPayload = { sub: userId, type: tokenTypes.REFRESH, sid: sessionId };

    const accessToken = jwt.sign(accessPayload, config.jwt.secret, {
        expiresIn: `${config.jwt.accessExpirationMinutes}m`,
    });
    const refreshToken = jwt.sign(refreshPayload, config.jwt.secret, {
        expiresIn: `${config.jwt.refreshExpirationDays}d`,
    });

    return { accessToken, refreshToken };
};

exports.register = catchAsync(async (req, res) => {
    const { email, password, full_name } = req.body;

    const exists = await User.isEmailTaken(email);
    if (exists) {
        throw new ApiError(httpStatus.CONFLICT, 'Email already taken');
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({
        email,
        password_hash,
        status: 'ACTIVE',
        profile: { full_name },
    });

    res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Registration successful',
        data: { user: { _id: user._id, email: user.email, profile: user.profile } },
    });
});

exports.login = catchAsync(async (req, res) => {
    const { identifier, password } = req.body;

    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    }).select('+password_hash');

    if (!user || !(await user.matchPassword(password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
    }
    if (user.status !== 'ACTIVE') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Account is not active');
    }

    const session = await Session.create({
        user_id: user._id,
        expires_at: new Date(Date.now() + config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000),
        user_agent: req.headers['user-agent'],
        ip_address: req.ip,
    });

    const { accessToken, refreshToken } = generateTokens(user._id, session._id);

    user.last_login_at = new Date();
    await user.save();

    res.json({
        success: true,
        data: {
            requiresOtp: false,
            user: {
                _id: user._id,
                email: user.email,
                profile: user.profile,
                status: user.status,
                global_role_ids: user.global_role_ids,
            },
            tokens: {
                access: { token: accessToken },
                refresh: { token: refreshToken },
            },
        },
    });
});

exports.logout = catchAsync(async (req, res) => {
    const token = getBearerToken(req);
    if (token) {
        try {
            await invalidateAccessToken(token);
        } catch (_) { /* ignore */ }
    }
    res.json({ success: true, message: 'Logged out successfully' });
});

exports.refreshTokens = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(httpStatus.BAD_REQUEST, 'Refresh token required');

    let payload;
    try {
        payload = jwt.verify(refreshToken, config.jwt.secret);
    } catch {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }

    if (payload.type !== tokenTypes.REFRESH) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
    }

    const user = await User.findById(payload.sub);
    if (!user || user.status !== 'ACTIVE') {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found or inactive');
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id, payload.sid);

    res.json({
        success: true,
        data: {
            tokens: {
                access: { token: newAccessToken },
                refresh: { token: newRefreshToken },
            },
        },
    });
});

exports.getMe = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate('global_role_ids');
    res.json({ success: true, data: { user } });
});

exports.forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    // Always return success to prevent email enumeration
    const user = await User.findOne({ email });
    if (user) {
        // TODO: Generate reset token and send email
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        await PasswordResetToken.create({
            user_id: user._id,
            token_hash: tokenHash,
            expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        });
        // TODO: Send email with reset link
    }
    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
});

exports.resetPassword = catchAsync(async (req, res) => {
    const { token, newPassword } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetToken = await PasswordResetToken.findOne({ token_hash: tokenHash, used_at: null });
    if (!resetToken || resetToken.expires_at < new Date()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Token is invalid or expired');
    }
    const user = await User.findById(resetToken.user_id);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    user.password_hash = await bcrypt.hash(newPassword, 12);
    user.password_changed_at = new Date();
    await user.save();
    resetToken.used_at = new Date();
    await resetToken.save();

    res.json({ success: true, message: 'Password reset successful' });
});

exports.verifyOtp = catchAsync(async (req, res) => {
    // Placeholder - implement OTP logic as needed
    res.json({ success: false, message: 'OTP verification not implemented yet' });
});

exports.changePassword = catchAsync(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password_hash');

    if (!(await user.matchPassword(oldPassword))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Old password is incorrect');
    }

    user.password_hash = await bcrypt.hash(newPassword, 12);
    user.password_changed_at = new Date();
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
});
