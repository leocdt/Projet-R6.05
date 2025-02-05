'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');
const Jwt = require('@hapi/jwt');

module.exports = class UserService extends Service {

    async create(user){
        const { User } = this.server.models();
        const { emailService } = this.server.services();

        const createdUser = await User.query().insertAndFetch(user);

        try {
            await emailService.sendWelcomeEmail(createdUser);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            // Si l'envoie de l'email a echoué, on ne veut pas empecher la création de l'utilisateur
        }

        return createdUser;
    }

    findAll(){
        const { User } = this.server.models();

        return User.query();
    }

    delete(id){
        const { User } = this.server.models();

        return User.query().deleteById(id);
    }

    update(id, user){
        const { User } = this.server.models();

        return User.query().findById(id).patch(user);
    }

    async login(email, password) {
        const { User } = this.server.models();

        const user = await User.query().findOne({ email, password });

        if (!user) {
            throw Boom.unauthorized('Invalid credentials');
        }

        const token = Jwt.token.generate(
            {
                aud: 'urn:audience:iut',
                iss: 'urn:issuer:iut',
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                scope: user.roles
            },
            {
                key: 'random_string', // La clé qui est définit dans lib/auth/strategies/jwt.js
                algorithm: 'HS512'
            },
            {
                ttlSec: 14400 // 4 heures
            }
        );

        return token;
    }
}
