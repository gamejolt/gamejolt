import { HistoryState, RouteLocationNormalized } from 'vue-router';
import { arrayRemove } from '../../../utils/array';

const MAX_ITEMS = 20;

interface HistoryCacheState<T = any> {
	tag: string | symbol | undefined;
	url: string;
	data?: T;
}

export class HistoryCache {
	private static states: HistoryCacheState[] = [];

	/**
	 * Returns the history state tracked by vue router, as long as we're not on
	 * the latest entry. This is so that we try to get historical states only
	 * (going back).
	 */
	static getHistoryState(): HistoryState | null {
		// vue-router maintains a history state for each route in the history.
		const historyState = typeof history !== 'undefined' ? history.state : undefined;
		if (!historyState || historyState.forward === null) {
			return null;
		}

		return historyState;
	}

	static get<T = any>(route: RouteLocationNormalized, tag?: string | symbol) {
		const state = this._get<T>(route, tag);

		if (state) {
			// We have to put the state back on top so that it was just
			// accessed. We don't want it being cleaned up.
			arrayRemove(this.states, i => i === state);
			this.states.push(state);

			return state.data;
		}

		return undefined;
	}

	static has(route: RouteLocationNormalized, tag?: string | symbol) {
		return !!this._get(route, tag);
	}

	private static _get<T = any>(route: RouteLocationNormalized, tag?: string | symbol) {
		const historyState = this.getHistoryState();
		if (!historyState) {
			return undefined;
		}

		return this.states.find(i => i.url === route.fullPath && i.tag === tag) as
			| HistoryCacheState<T>
			| undefined;
	}

	static store<T = any>(route: RouteLocationNormalized, data: T, tag?: string | symbol) {
		const state = this.get(route, tag);

		if (state) {
			state.data = data;
		} else {
			const url = route.fullPath;

			this.states.push({
				tag,
				url,
				data,
			});

			// Prune the cache data to a certain number of states.
			this.states = this.states.slice(-MAX_ITEMS);
		}
	}
}
