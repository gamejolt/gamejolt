import { Route } from 'vue-router';

export function getSplitTestSimpleShell() {
	const key = 'simple_shell';
	return (splitTests[key] ??= new SplitTest(key));
}

const splitTests: Record<string, SplitTest> = {};

class SplitTest {
	constructor(public name: string) {}

	get value(): boolean {
		return getClientSideVariation(this.name) === 2;
	}
}

function getClientSideVariation(experiment: string, route?: Route): number {
	if (GJ_IS_SSR) {
		return 1;
	}

	let variation = checkHardcoded(experiment, route);
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

function checkHardcoded(experiment: string, route?: Route): number {
	if (GJ_IS_SSR) {
		return -1;
	}

	// Allows you to put the experiment in the URL to force it.
	// Example: /games/best?oCnfrO9TSku9N0t3viKvKg=1
	if (route) {
		const query = route.query;
		if (query[experiment]) {
			return parseInt(query[experiment] as string, 10);
		}
	}

	// Allow you to force an experiment variation permanently through localStorage.
	const experimentId = window.localStorage.getItem(experiment);
	if (experimentId) {
		return parseInt(experimentId, 10);
	}

	return -1;
}
