const cluster = require('cluster');

const numWorkers = require('os').cpus().length;

if (cluster.isPrimary) {
	console.log(`Primary ${process.pid} is running`);

	// Workers ask for permission before they start their request-threshold
	// drain. We grant it to one worker at a time so the rest of the pool keeps
	// serving traffic — important on small core counts (e.g. 2 cores in prod)
	// where two simultaneous drains would briefly leave us with zero healthy
	// workers and queue up real user requests.
	/** @type {number | null} */
	let drainingWorkerId = null;
	/** @type {number[]} */
	const drainQueue = [];

	// Replacement workers take a few seconds to fork, eval the SSR bundle, and
	// register with us. We track the set of workers actually in the dispatch
	// pool (those that have fired 'listening') so we can refuse to grant a new
	// drain until the pool is back to full capacity. Otherwise we'd be down two
	// workers at once: the previous one that just exited, plus the next one
	// about to drain — leaving 0 healthy workers on a 2-core box.
	/** @type {Set<number>} */
	const listeningWorkers = new Set();

	function isPoolAtFullCapacity() {
		return listeningWorkers.size >= numWorkers;
	}

	function tryGrantNextDrain() {
		if (drainingWorkerId !== null || !isPoolAtFullCapacity()) {
			return;
		}
		while (drainQueue.length > 0) {
			const id = drainQueue.shift();
			const next = id !== undefined ? cluster.workers?.[id] : undefined;
			if (next) {
				drainingWorkerId = id ?? null;
				next.send({ cmd: 'drain-granted' });
				return;
			}
			// Worker died while queued — skip and try the next one.
		}
	}

	// Fork workers.
	for (let i = 0; i < numWorkers; i++) {
		cluster.fork();
	}

	cluster.on(
		'listening',
		/** @param {import('cluster').Worker} worker */
		worker => {
			listeningWorkers.add(worker.id);
			// Replacement just came online — if anyone was waiting for the pool
			// to recover before draining, this is their cue.
			tryGrantNextDrain();
		}
	);

	cluster.on(
		'message',
		/**
		 * @param {import('cluster').Worker} worker
		 * @param {unknown} msg
		 */
		(worker, msg) => {
			if (typeof msg !== 'object' || msg === null || msg.cmd !== 'request-drain') {
				return;
			}

			if (!drainQueue.includes(worker.id) && drainingWorkerId !== worker.id) {
				drainQueue.push(worker.id);
			}
			tryGrantNextDrain();
		}
	);

	// When the worker exits, just restart.
	cluster.on(
		'exit',
		/**
		 * @param {import('cluster').Worker} worker
		 * @param {number} _code
		 * @param {string} _signal
		 */
		(worker, _code, _signal) => {
			console.log(`Worker ${worker.process.pid} died`);

			listeningWorkers.delete(worker.id);

			// Free the drain slot if this was the draining worker. Note: we do
			// NOT immediately grant the next one here — capacity is now N-1, so
			// we wait for the replacement's 'listening' event before granting.
			if (drainingWorkerId === worker.id) {
				drainingWorkerId = null;
			}

			const queuedIdx = drainQueue.indexOf(worker.id);
			if (queuedIdx !== -1) {
				drainQueue.splice(queuedIdx, 1);
			}

			cluster.fork();
		}
	);
} else {
	console.log(`Worker ${process.pid} started`);
	require('./server.js');
}
