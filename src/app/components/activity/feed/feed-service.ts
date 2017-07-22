import { ActivityFeedInput } from './item-service';
import { ActivityFeedContainer, ActivityFeedContainerOptions } from './feed-container-service';

/**
 * Number of states we will keep cached.
 * We will purge others out of the cache.
 */
const MaxCachedCount = 3;

interface ActivityFeedState {
	key?: string;
	container: ActivityFeedContainer;
}

export class ActivityFeedService {
	private static _states: ActivityFeedState[] = [];

	static bootstrap(items?: ActivityFeedInput[], options?: ActivityFeedContainerOptions) {
		// vue-router maintains a history key for each route in the history.
		const key: string | undefined = history.state && history.state.key;

		// If we have a state container for this historical key...
		let state = this._states.find(item => item.key === key);
		if (state) {
			return state.container;
		}

		// If items passed in were null then they were trying to pull from
		// cache. Since we got here we don't have any cached state, so return
		// null.
		if (!items || !options) {
			return null;
		}

		// New state, yay!
		state = {
			key,
			container: new ActivityFeedContainer(items, options),
		};

		// Keep it trimmed.
		this._states.unshift(state);
		this._states = this._states.slice(0, MaxCachedCount);

		return state.container;
	}
}
