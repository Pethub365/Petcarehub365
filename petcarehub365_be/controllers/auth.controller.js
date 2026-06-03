const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { User, Session, InvalidatedToken, PasswordResetToken, EmailVerificationToken } = require('../models');
const config = require('../config/config');
const { tokenTypes } = require('../constants/tokens');
const { getBearerToken, invalidateAccessToken } = require('../utils/token.util');
const sendEmail = require('../utils/sendEmail');

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
        is_email_verified: true,
        profile: { full_name },
    });

    res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        data: { user: { _id: user._id, email: user.email, profile: user.profile, status: user.status } },
    });
});

exports.login = catchAsync(async (req, res) => {
    const { identifier, password } = req.body;

    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    }).select('+password_hash');

    if (!user || !(await user.matchPassword(password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
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
                subscription_plan: user.subscription_plan,
                is_vip: user.is_vip,
                subscription_expires_at: user.subscription_expires_at,
                vip_expires_at: user.vip_expires_at,
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
    const user = await User.findOne({ email });
    if (user) {
        // Generate random 6-digit OTP code for password reset
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await PasswordResetToken.create({
            user_id: user._id,
            token_hash: otp,
            expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        // Send email with OTP code
        try {
            await sendEmail({
                to: user.email,
                subject: 'Yêu cầu khôi phục mật khẩu PetcareHub365 🐾',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #4F46E5;">Khôi phục mật khẩu tài khoản của bạn</h2>
                        <p>Mã xác thực OTP đặt lại mật khẩu của bạn là:</p>
                        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; color: #6366F1; letter-spacing: 5px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p>Mã này có hiệu lực trong 10 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
                        <p>Trân trọng,<br/>Đội ngũ PetcareHub365</p>
                    </div>
                `
            });
        } catch (err) {
            console.error('Không thể gửi mail OTP reset password:', err.message);
        }
    }
    res.json({ success: true, message: 'Nếu email tồn tại, mã xác thực OTP khôi phục mật khẩu đã được gửi.' });
});

exports.resetPassword = catchAsync(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy người dùng');

    const resetToken = await PasswordResetToken.findOne({
        user_id: user._id,
        token_hash: otp,
        used_at: null,
        expires_at: { $gt: new Date() }
    });

    if (!resetToken) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    user.password_hash = await bcrypt.hash(newPassword, 12);
    user.password_changed_at = new Date();
    await user.save();

    resetToken.used_at = new Date();
    await resetToken.save();

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
});

exports.verifyOtp = catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'Không tìm thấy người dùng');

    const tokenRecord = await EmailVerificationToken.findOne({
        user_id: user._id,
        token_hash: otp,
        expires_at: { $gt: new Date() }
    });

    if (!tokenRecord) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Mã xác thực OTP không hợp lệ hoặc đã hết hạn');
    }

    user.status = 'ACTIVE';
    user.is_email_verified = true;
    await user.save();

    // Delete token after successful verification
    await EmailVerificationToken.deleteMany({ user_id: user._id });

    res.json({ success: true, message: 'Kích hoạt tài khoản thành công!' });
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
