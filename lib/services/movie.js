'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class MovieService extends Service {

    static get name() {
        return 'movieService';
    }

    async create(movie) {
        const { Movie } = this.server.models();
        return Movie.query().insertAndFetch(movie);
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
        const { Movie } = this.server.models();
        const updatedMovie = await Movie.query().patchAndFetchById(id, movie);

        if (!updatedMovie) {
            throw Boom.notFound('Film non trouvé');
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
};
