'use strict';

module.exports = {
    async up(knex) {
        await knex.schema.createTable('user_favorites', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNull().references('id').inTable('user').onDelete('CASCADE');
            table.integer('movie_id').unsigned().notNull().references('id').inTable('movies').onDelete('CASCADE');
            table.timestamps(true, true);
            
            // Contrainte d'unicité pour éviter les doublons
            table.unique(['user_id', 'movie_id']);
        });
    },

    async down(knex) {
        await knex.schema.dropTableIfExists('user_favorites');
    }
};
