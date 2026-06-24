import axiosClient from './axiosClient';

const feedbackApi = {
  submitFeedback: (data: { rating: number; comment?: string }) =>
    axiosClient.post('/feedbacks', data),
  getFeedbacks: () => axiosClient.get('/feedbacks'),
  getFeedbackStats: () => axiosClient.get('/feedbacks/stats'),
};

export default feedbackApi;
