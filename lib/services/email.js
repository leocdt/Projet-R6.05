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
                from: process.env.EMAIL_FROM || '"Filmotheque CL" <noreply@filmothequeCL.com>',
                to: user.email,
                subject: 'Bienvenue sur notre application !',
                text: `Bonjour ${user.firstName},\n\nBienvenue sur notre application ! Nous sommes ravis de vous compter parmi nos utilisateurs.\n\nCordialement,\nL'équipe`,
                html: `
                    <h1>Bienvenue ${user.firstName} !</h1>
                    <p>Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
                    <p>Cordialement,<br>L'équipe de la Filmotheque CL</p>
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

    async sendNewMovieNotification(movie, users) {
        try {
            // On envoie le mail à tous les utilisateurs
            for (const user of users) {
                const info = await this.transporter.sendMail({
                    from: process.env.EMAIL_FROM || '"Filmotheque CL" <noreply@filmothequeCL.com>',
                    to: user.email,
                    subject: 'Nouveau film ajouté !',
                    text: `Bonjour ${user.firstName},\n\nUn nouveau film vient d'être ajouté : ${movie.title}\n\nDescription : ${movie.description}\nRéalisateur : ${movie.director}\nDate de sortie : ${movie.releaseDate}\n\nCordialement,\nL'équipe`,
                    html: `
                        <h1>Nouveau film : ${movie.title}</h1>
                        <p>Un nouveau film vient d'être ajouté à notre catalogue :</p>
                        <ul>
                            <li><strong>Description :</strong> ${movie.description}</li>
                            <li><strong>Réalisateur :</strong> ${movie.director}</li>
                            <li><strong>Date de sortie :</strong> ${movie.releaseDate}</li>
                        </ul>
                        <p>Cordialement,<br>L'équipe de la Filmotheque CL</p>
                    `
                });

                // On ne log que le premier mail pour éviter trop de logs
                if (users.indexOf(user) === 0) {
                    console.log('Preview URL for first user:', nodemailer.getTestMessageUrl(info));
                }
            }
            return { success: true };
        } catch (error) {
            console.error('Error sending new movie notification:', error);
            throw error;
        }
    }

    async sendMovieUpdateNotification(movie, users) {
        try {
            // On envoie le mail aux utilisateurs qui ont ce film en favori
            for (const user of users) {
                const info = await this.transporter.sendMail({
                    from: process.env.EMAIL_FROM || '"Filmotheque CL" <noreply@filmothequeCL.com>',
                    to: user.email,
                    subject: 'Un film de vos favoris a été mis à jour !',
                    text: `Bonjour ${user.firstName},\n\nLe film "${movie.title}" que vous avez en favori a été mis à jour.\n\nNouvelles informations :\nDescription : ${movie.description}\nRéalisateur : ${movie.director}\nDate de sortie : ${movie.releaseDate}\n\nCordialement,\nL'équipe`,
                    html: `
                        <h1>Mise à jour : ${movie.title}</h1>
                        <p>Un film de vos favoris a été mis à jour :</p>
                        <ul>
                            <li><strong>Description :</strong> ${movie.description}</li>
                            <li><strong>Réalisateur :</strong> ${movie.director}</li>
                            <li><strong>Date de sortie :</strong> ${movie.releaseDate}</li>
                        </ul>
                        <p>Cordialement,<br>L'équipe de la Filmotheque CL</p>
                    `
                });

                // On ne log que le premier mail pour éviter trop de logs
                if (users.indexOf(user) === 0) {
                    console.log('Preview URL for first user:', nodemailer.getTestMessageUrl(info));
                }
            }
            return { success: true };
        } catch (error) {
            console.error('Error sending movie update notification:', error);
            throw error;
        }
    }
}
