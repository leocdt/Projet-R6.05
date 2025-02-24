'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class MovieService extends Service {

    static get name() {
        return 'movieService';
    }

    async create(movie) {
        const { Movie, User } = this.server.models();
        const { emailService } = this.server.services();

        // Création du film
        const newMovie = await Movie.query().insertAndFetch(movie);

        try {
            // Récupération de tous les utilisateurs pour la notification
            const users = await User.query();
            await emailService.sendNewMovieNotification(newMovie, users);
        } catch (error) {
            console.error('Failed to send new movie notification:', error);
            // On ne veut pas que l'échec de l'envoi des mails empêche la création du film
        }

        return newMovie;
    }

    async findAll() {
        const { Movie } = this.server.models();
        return Movie.query();
    }

    async findById(id) {
        const { Movie } = this.server.models();
        const movie = await Movie.query().findById(id);
        
        if (!movie) {
            throw Boom.notFound('Film non trouvé');
        }
        
        return movie;
    }

    async update(id, movie) {
        const { Movie, User } = this.server.models();
        const { emailService } = this.server.services();

        const updatedMovie = await Movie.query().patchAndFetchById(id, movie);

        if (!updatedMovie) {
            throw Boom.notFound('Film non trouvé');
        }

        try {
            // Récupération des utilisateurs qui ont ce film en favori
            const users = await User.query()
                .joinRelated('favoriteMovies')
                .where('favoriteMovies.id', id);

            if (users.length > 0) {
                await emailService.sendMovieUpdateNotification(updatedMovie, users);
            }
        } catch (error) {
            console.error('Failed to send movie update notification:', error);
            // On ne veut pas que l'échec de l'envoi des mails empêche la mise à jour du film
        }

        return updatedMovie;
    }

    async delete(id) {
        const { Movie } = this.server.models();
        const deleted = await Movie.query().deleteById(id);

        if (!deleted) {
            throw Boom.notFound('Film non trouvé');
        }

        return { success: true };
    }

    async addToFavorites(userId, movieId) {
        const { Movie, User } = this.server.models();
        
        try {
            const user = await User.query().findById(userId);
            const movie = await Movie.query().findById(movieId);

            if (!user || !movie) {
                throw Boom.notFound('Utilisateur ou film non trouvé');
            }

            await user.$relatedQuery('favoriteMovies').relate(movie);
            return { success: true };
        } catch (error) {
            if (error.code === '23505') { // Code PostgreSQL pour violation de contrainte unique
                throw Boom.conflict('Ce film est déjà dans vos favoris');
            }
            throw error;
        }
    }

    async removeFromFavorites(userId, movieId) {
        const { Movie, User } = this.server.models();
        
        const user = await User.query().findById(userId);
        const movie = await Movie.query().findById(movieId);

        if (!user || !movie) {
            throw Boom.notFound('Utilisateur ou film non trouvé');
        }

        const deleted = await user.$relatedQuery('favoriteMovies').unrelate().where('movies.id', movieId);
        
        if (!deleted) {
            throw Boom.notFound('Ce film n\'est pas dans vos favoris');
        }

        return { success: true };
    }

    async getUserFavorites(userId) {
        const { User } = this.server.models();
        
        const user = await User.query().findById(userId);
        
        if (!user) {
            throw Boom.notFound('Utilisateur non trouvé');
        }

        return user.$relatedQuery('favoriteMovies');
    }

    async generateMoviesCsv() {
        const { Movie } = this.server.models();
        const movies = await Movie.query();
        
        const { stringify } = require('csv-stringify/sync');
        return new Promise((resolve, reject) => {
            try {
                const csvData = stringify(movies, {
                    header: true,
                    columns: {
                        title: 'Title',
                        description: 'Description',
                        releaseDate: 'Release Date',
                        director: 'Director',
                        created_at: 'Created At',
                        updated_at: 'Updated At'
                    }
                });
                resolve(csvData);
            } catch (error) {
                reject(error);
            }
        });
    }
};
