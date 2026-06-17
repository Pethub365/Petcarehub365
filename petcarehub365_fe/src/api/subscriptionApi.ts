import axiosClient from './axiosClient';

const subscriptionApi = {
  getPlans: () => axiosClient.get('/subscriptions/plans'),
  getMySubscription: () => axiosClient.get('/subscriptions/me'),
  getTransactions: () => axiosClient.get('/subscriptions/transactions'),
  upgradeSubscription: (
    plan_type: 'PREMIUM' | 'VIP',
    package_duration: 'MONTHLY' | 'YEARLY' = 'MONTHLY',
    payment_method: string = 'MANUAL'
  ) => axiosClient.post('/subscriptions/upgrade', { plan_type, package_duration, payment_method }),
  cancelAutoRenew: () => axiosClient.post('/subscriptions/cancel'),
};

export default subscriptionApi;
