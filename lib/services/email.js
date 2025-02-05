'use strict';

const { Service } = require('@hapipal/schmervice');
const nodemailer = require('nodemailer');

module.exports = class EmailService extends Service {

    static get name() {
        return 'emailService';
    }

    constructor(server) {
        super(server);
        this.transporter = null;
        this.initialize();
    }

    async initialize() {
        // Création d'un compte test
        const testAccount = await nodemailer.createTestAccount();

        // Création d'un transporteur réutilisable en utilisant le transport SMTP Ethereal
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER || testAccount.user,
                pass: process.env.EMAIL_PASS || testAccount.pass
            }
        });
    }

    async sendWelcomeEmail(user) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || '"Your App" <noreply@yourapp.com>',
                to: user.email,
                subject: 'Bienvenue sur notre application !',
                text: `Bonjour ${user.firstName},\n\nBienvenue sur notre application ! Nous sommes ravis de vous compter parmi nos utilisateurs.\n\nCordialement,\nL'équipe`,
                html: `
                    <h1>Bienvenue ${user.firstName} !</h1>
                    <p>Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
                    <p>Cordialement,<br>L'équipe</p>
                `
            });

            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
        } catch (error) {
            console.error('Error sending welcome email:', error);
            throw error;
        }
    }
}
