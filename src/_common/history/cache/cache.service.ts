import { Route } from 'vue-router';
import { arrayRemove } from '../../../utils/array';

const MAX_ITEMS = 10;

interface HistoryCacheState {
	stateKey: any;
	tag: string | undefined;
	url: string;
	data?: any;
}

export class HistoryCache {
	private static states: HistoryCacheState[] = [];

	private static getStateKey() {
		// vue-router maintains a history key for each route in the history.
		return typeof history !== 'undefined' ? history.state && history.state.key : undefined;
	}

	static get(route: Route, tag?: string) {
		const stateKey = this.getStateKey();
		const state = this.states.find(
			i => i.url === route.fullPath && i.tag === tag && i.stateKey === stateKey
		);

		if (state) {
			// We have to put the state back on top so that it was just
			// accessed. We don't want it being cleaned up.
			arrayRemove(this.states, i => i === state);
			this.states.push(state);

			return state;
		}

		return null;
	}

	static has(route: Route, tag?: string) {
		return !!this.get(route, tag);
	}

	static store(route: Route, data: any, tag?: string) {
		const state = this.get(route, tag);

		if (state) {
			state.data = data;
		} else {
			const url = route.fullPath;
			const stateKey = this.getStateKey();

			this.states.push({
				stateKey,
				tag,
				url,
				data,
			});

			// Prune the cache data to a certain number of states.
			this.states = this.states.slice(-MAX_ITEMS);
		}
	}
}
