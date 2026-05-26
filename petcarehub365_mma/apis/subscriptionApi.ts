import axiosClient from './axiosClient';

const subscriptionApi = {
  upgradeVip: (packageType: 'MONTHLY' | 'YEARLY') => 
    axiosClient.post('/subscriptions/upgrade', { package_type: packageType }),
};

export default subscriptionApi;
