'use strict';

module.exports = {
    async up(knex) {
        await knex.schema.createTable('movies', (table) => {
            table.increments('id').primary();
            table.string('title').notNull();
            table.text('description').notNull();
            table.date('releaseDate').notNull();
            table.string('director').notNull();
            table.timestamps(true, true); // Crée created_at et updated_at
        });
    },

    async down(knex) {
        await knex.schema.dropTableIfExists('movies');
    }
};
