'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class User extends Model {

    static get tableName() {

        return 'user';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
            lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
            email: Joi.string().email(),
            password: Joi.string(),
            username: Joi.string(),
            roles: Joi.array().items(Joi.string()).default(['user']),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert(queryContext) {

        this.updatedAt = new Date();
        this.createdAt = this.updatedAt;
    }

    $beforeUpdate(opt, queryContext) {

        this.updatedAt = new Date();
    }

    static get jsonAttributes() {

        return ['roles']
    }

    static get relationMappings() {
        const Movie = require('./movie');

        return {
            favoriteMovies: {
                relation: Model.ManyToManyRelation,
                modelClass: Movie,
                join: {
                    from: 'user.id',
                    through: {
                        from: 'user_favorites.user_id',
                        to: 'user_favorites.movie_id'
                    },
                    to: 'movies.id'
                }
            }
        };
    }
};
