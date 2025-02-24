'use strict';

const Glue = require('@hapi/glue');
const Exiting = require('exiting');
const Manifest = require('./manifest');

exports.deployment = async ({ start } = {}) => {

    const manifest = Manifest.get('/', process.env);
    const server = await Glue.compose(manifest, { relativeTo: __dirname });

    if (start) {
        await Exiting.createManager(server).start();
        server.log(['start'], `Server started at ${server.info.uri}`);
        return server;
    }

    await server.initialize();

    return server;
};

const start = async () => {
    const server = await exports.deployment();
    await server.start();
    
    const { queueService } = server.services();
    await queueService.startConsumer();
    
    console.log('Server running at:', server.info.uri);
};

if (require.main === module) {

    exports.deployment({ start: true });

    process.on('unhandledRejection', (err) => {

        throw err;
    });
}
