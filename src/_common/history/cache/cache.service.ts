import { HistoryState, RouteLocationNormalized } from 'vue-router';
import { arrayRemove } from '../../../utils/array';

const MAX_ITEMS = 20;

interface HistoryCacheState<T = any> {
	tag: string | symbol | undefined;
	url: string;
	data?: T;
}

class HistoryCacheService {
	private states: HistoryCacheState[] = [];

	/**
	 * Returns the history state tracked by vue router, as long as we're not on
	 * the latest entry. This is so that we try to get historical states only
	 * (going back).
	 */
	getHistoryState(): HistoryState | null {
		// vue-router maintains a history state for each route in the history.
		const historyState = typeof history !== 'undefined' ? history.state : undefined;
		if (!historyState || historyState.forward === null) {
			return null;
		}

		return historyState;
	}

	get<T = any>(route: RouteLocationNormalized, tag?: string | symbol) {
		const state = this._get<T>(route, tag);

		if (state) {
			this._touchState(state);
			return state.data;
		}

		return undefined;
	}

	has(route: RouteLocationNormalized, tag?: string | symbol) {
		return !!this._get(route, tag);
	}

	store<T = any>(route: RouteLocationNormalized, data: T, tag?: string | symbol) {
		const state = this._get(route, tag);

		if (state) {
			state.data = data;
			this._touchState(state);
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

	private _get<T = any>(route: RouteLocationNormalized, tag?: string | symbol) {
		const historyState = this.getHistoryState();
		if (!historyState) {
			return undefined;
		}

		return this.states.find(i => i.url === route.fullPath && i.tag === tag) as
			| HistoryCacheState<T>
			| undefined;
	}

	/**
	 * Call this to put the state back on top of the states array so that it
	 * doesn't get cleaned up.
	 */
	private _touchState(state: HistoryCacheState) {
		arrayRemove(this.states, i => i === state);
		this.states.push(state);
	}
}

export const HistoryCache = /** @__PURE__ */ new HistoryCacheService();
