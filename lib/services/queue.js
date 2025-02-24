'use strict';

const { Service } = require('@hapipal/schmervice');
const amqp = require('amqplib');

module.exports = class QueueService extends Service {

    static get name() {
        return 'queueService';
    }

    constructor(server) {
        super(server);
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
        this.init();
    }

    async init() {
        try {
            await this.initialize();
            await this.startConsumer();
        } catch (error) {
            console.error('Failed to initialize queue service:', error);
        }
    }

    async initialize() {
        if (this.isConnected) return;

        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
            this.channel = await this.connection.createChannel();
            
            // Gérer la fermeture de la connexion
            this.connection.on('close', () => {
                console.log('RabbitMQ connection closed');
                this.isConnected = false;
            });

            // Gérer les erreurs de connexion
            this.connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
                this.isConnected = false;
            });

            await this.channel.assertQueue('movie-exports', {
                durable: true
            });

            this.isConnected = true;
        } catch (error) {
            console.error('Failed to initialize RabbitMQ:', error);
            this.isConnected = false;
            throw error;
        }
    }

    async publishExportRequest(userEmail) {
        if (!this.isConnected) {
            await this.initialize();
        }

        await this.channel.sendToQueue('movie-exports', 
            Buffer.from(JSON.stringify({ userEmail })),
            { persistent: true }
        );
    }

    async startConsumer() {
        if (!this.isConnected) {
            await this.initialize();
        }

        await this.channel.prefetch(1);


        this.channel.consume('movie-exports', async (msg) => {
            if (msg === null) return;

            try {
                const { emailService, movieService } = this.server.services();
                const data = JSON.parse(msg.content.toString());
                
                console.log('Generating CSV and sending email to user:', data.userEmail);
                const csvData = await movieService.generateMoviesCsv();
                
                const result = await emailService.sendMovieExportEmail(data.userEmail, csvData);
                console.log('Email sent successfully. Preview URL:', result.previewUrl);
                
                await this.channel.ack(msg);
                console.log('Message acknowledged');
            } catch (error) {
                console.error('Error processing export request:', error);
                // Ne pas rejeter le message en cas d'erreur pour éviter la boucle
                await this.channel.ack(msg);
            }
        });

        console.log('Consumer started successfully');
    }

    async stop() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.isConnected = false;
            console.log('RabbitMQ connection closed gracefully');
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
        }
    }
};
