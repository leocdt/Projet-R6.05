'use strict';

const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || '0.0.0.0',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
});

const dbName = process.env.DB_NAME || 'iut';

const resetDatabase = async () => {
    return new Promise((resolve, reject) => {
        connection.query(`DROP DATABASE IF EXISTS ${dbName}`, (err) => {
            if (err) {
                console.error('Error dropping database:', err);
                reject(err);
                return;
            }

            connection.query(`CREATE DATABASE ${dbName}`, (err) => {
                if (err) {
                    console.error('Error creating database:', err);
                    reject(err);
                    return;
                }

                console.log('Database reset successfully');
                resolve();
            });
        });
    });
};

resetDatabase()
    .then(() => {
        connection.end();
        process.exit(0);
    })
    .catch((err) => {
        console.error('Failed to reset database:', err);
        connection.end();
        process.exit(1);
    });
