import axios from 'axios';

export class ChapmailService {
  API_URL = 'https://api.chapmail.io/sendMail';
  API_KEY = 'YOUR_CHAPMAIL_API_KEY';

  sendMail(data: {
    senderName: string;
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
    templateName?: string;
    templateData?: Record<string, string>;
    attachments?: any[];
  }) {
    return axios.post<{ messageId: string }>(`${this.API_URL}`, {
      apiKey: this.API_KEY,
      ...data,
    });
  }
}
