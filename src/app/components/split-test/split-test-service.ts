import { Route } from 'vue-router';

function getPayloadVariation(route: Route, payload: any, experiment: string): number {
	let variation = checkHardcoded(route, experiment);
	if (variation !== -1) {
		return variation;
	}

	if (typeof payload._experiment !== 'undefined' && typeof payload._variation !== 'undefined') {
		if (payload._experiment === experiment) {
			return payload._variation;
		}
	}

	return -1;
}

function getClientSideVariation(route: Route, experiment: string): number {
	if (GJ_IS_SSR) {
		return 1;
	}

	let variation = checkHardcoded(route, experiment);
	if (variation !== -1) {
		return variation;
	}

	// Generate their variation.
	// Only supports half and half currently.
	variation = 1;
	if (Math.random() > 0.5) {
		variation = 2;
	}

	window.localStorage.setItem(experiment, variation + '');
	return variation;
}

function checkHardcoded(route: Route, experiment: string): number {
	if (GJ_IS_SSR) {
		return -1;
	}

	// Allows you to put the experiment in the URL to force it.
	// Example: /games/best?oCnfrO9TSku9N0t3viKvKg=1
	const query = route.query;
	if (query[experiment]) {
		return parseInt(query[experiment], 10);
	}

	// Allow you to force an experiment variation permanently through localStorage.
	const experimentId = window.localStorage.getItem(experiment);
	if (experimentId) {
		return parseInt(experimentId, 10);
	}

	return -1;
}
