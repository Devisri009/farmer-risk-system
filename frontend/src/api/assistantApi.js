import client from './client';

export const sendAssistantMessage = (data) => client.post('/assistant', data);
