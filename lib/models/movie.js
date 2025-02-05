'use strict';

const { Model } = require('@hapipal/schwifty');
const Joi = require('joi');

module.exports = class Movie extends Model {

    static get tableName() {
        return 'movies';
    }

    static get joiSchema() {
        return Joi.object({
            id: Joi.number().integer().greater(0),
            title: Joi.string().required().min(1).max(255).description('Titre du film'),
            description: Joi.string().required().min(10).description('Description du film'),
            releaseDate: Joi.date().required().description('Date de sortie du film'),
            director: Joi.string().required().min(3).max(255).description('Réalisateur du film'),
            created_at: Joi.date(),
            updated_at: Joi.date()
        });
    }

    $beforeInsert(queryContext) {
        this.created_at = new Date();
        this.updated_at = new Date();
    }

    $beforeUpdate(opt, queryContext) {
        this.updated_at = new Date();
    }

    static get relationMappings() {
        const User = require('./user');

        return {
            favoritedBy: {
                relation: Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'movies.id',
                    through: {
                        from: 'user_favorites.movie_id',
                        to: 'user_favorites.user_id'
                    },
                    to: 'user.id'
                }
            }
        };
    }
};
