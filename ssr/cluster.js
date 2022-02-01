const cluster = require('cluster');

const numWorkers = require('os').cpus().length;

if (cluster.isMaster) {
	console.log(`Master ${process.pid} is running`);

	// Fork workers.
	for (let i = 0; i < numWorkers; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
		cluster.fork();
	});
} else {
	console.log(`Worker ${process.pid} started`);
	require('./server.js');
}
