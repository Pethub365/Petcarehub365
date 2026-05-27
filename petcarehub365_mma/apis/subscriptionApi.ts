import axiosClient from './axiosClient';

const subscriptionApi = {
    // Danh sách gói + trạng thái user hiện tại
    getPlans: () =>
        axiosClient.get('/subscriptions/plans'),

    // Thông tin gói hiện tại của user
    getMySubscription: () =>
        axiosClient.get('/subscriptions/me'),

    // Lịch sử giao dịch
    getTransactions: () =>
        axiosClient.get('/subscriptions/transactions'),

    // Nâng cấp gói
    upgradeSubscription: (
        plan_type: 'PREMIUM' | 'VIP',
        package_duration: 'MONTHLY' | 'YEARLY' = 'MONTHLY',
        payment_method: string = 'MANUAL'
    ) =>
        axiosClient.post('/subscriptions/upgrade', { plan_type, package_duration, payment_method }),

    // Legacy alias giữ tương thích ngược với checkout.tsx cũ
    upgradeVip: (packageType: 'MONTHLY' | 'YEARLY') =>
        axiosClient.post('/subscriptions/upgrade', {
            plan_type: 'VIP',
            package_duration: packageType,
        }),

    // Huỷ gia hạn tự động
    cancelAutoRenew: () =>
        axiosClient.post('/subscriptions/cancel'),
};

export default subscriptionApi;
