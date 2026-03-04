import apiClient from './client';

export const sendMessageToAssistant = (message) => apiClient.post('/assistant', { message });
