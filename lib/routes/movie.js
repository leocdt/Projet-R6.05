'use strict';

const Joi = require('joi');

module.exports = [
    {
        method: 'post',
        path: '/movies',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    title: Joi.string().required().min(1).max(255).example('Inception').description('Titre du film'),
                    description: Joi.string().required().min(10).example('Un film sur les rêves').description('Description du film'),
                    releaseDate: Joi.date().required().example('2010-07-16').description('Date de sortie du film'),
                    director: Joi.string().required().min(3).max(255).example('Christopher Nolan').description('Réalisateur du film')
                })
            }
        },
        handler: async (request, h) => {
            const { movieService } = request.services();
            return await movieService.create(request.payload);
        }
    },
    {
        method: 'get',
        path: '/movies',
        options: {
            auth: {
                scope: ['admin', 'user']
            },
            tags: ['api']
        },
        handler: async (request, h) => {
            const { movieService } = request.services();
            return await movieService.findAll();
        }
    },
    {
        method: 'get',
        path: '/movies/{id}',
        options: {
            auth: {
                scope: ['admin', 'user']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().min(1)
                })
            }
        },
        handler: async (request, h) => {
            const { movieService } = request.services();
            return await movieService.findById(request.params.id);
        }
    },
    {
        method: 'patch',
        path: '/movies/{id}',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().min(1)
                }),
                payload: Joi.object({
                    title: Joi.string().min(1).max(255),
                    description: Joi.string().min(10),
                    releaseDate: Joi.date(),
                    director: Joi.string().min(3).max(255)
                }).min(1)
            }
        },
        handler: async (request, h) => {
            const { movieService } = request.services();
            return await movieService.update(request.params.id, request.payload);
        }
    },
    {
        method: 'delete',
        path: '/movies/{id}',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().min(1)
                })
            }
        },
        handler: async (request, h) => {
            const { movieService } = request.services();
            return await movieService.delete(request.params.id);
        }
    },
    {
        method: 'post',
        path: '/movies/{id}/favorite',
        options: {
            auth: {
                scope: ['user', 'admin']
            },
            tags: ['api'],
            description: 'Ajouter un film aux favoris',
            validate: {
                params: Joi.object({
                    id: Joi.number().required()
                })
            }
        },
        handler: async (request, h) => {
            const { movieService } = request.services();
            const userId = request.auth.credentials.id;
            const movieId = request.params.id;

            return await movieService.addToFavorites(userId, movieId);
        }
    },
    {
        method: 'delete',
        path: '/movies/{id}/favorite',
        options: {
            auth: {
                scope: ['user']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().min(1)
                })
            }
        },
        handler: async (request, h) => {
            const { movieService } = request.services();
            const userId = request.auth.credentials.id;
            return await movieService.removeFromFavorites(userId, request.params.id);
        }
    },
    {
        method: 'get',
        path: '/movies/favorites',
        options: {
            auth: {
                scope: ['user', 'admin']
            },
            tags: ['api'],
            description: 'Récupérer les films favoris de l\'utilisateur'
        },
        handler: async (request, h) => {
            const { movieService } = request.services();
            const userId = request.auth.credentials.id;

            return await movieService.getUserFavorites(userId);
        }
    },
    {
        method: 'post',
        path: '/movies/export',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            description: 'Export movies to CSV and send by email'
        },
        handler: async (request, h) => {
            const { queueService } = request.services();
            const userEmail = request.auth.credentials.email;
            
            await queueService.publishExportRequest(userEmail);
            
            return { 
                message: 'Export request received. You will receive the CSV file by email shortly.' 
            };
        }
    }
];
