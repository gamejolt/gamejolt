import { ActivityFeedInput } from './item-service';
import { ActivityFeedContainer, ActivityFeedContainerOptions } from './feed-container-service';
import { History } from '../../../../lib/gj-lib-client/components/history/history.service';
import { router } from '../../../bootstrap';

/**
 * Number of states we will keep cached.
 * We will purge others out of the cache.
 */
const MAX_CACHED_COUNT = 3;

export interface BootstrapOptions extends ActivityFeedContainerOptions
{
	/**
	 * Override to say if it's a historical bootstrap or not.
	 * Useful if you are lazy loading the page.
	 */
	inHistorical?: boolean;
}

interface ActivityFeedState
{
	url: string;
	container: ActivityFeedContainer;
}

export class ActivityFeedService
{
	private static _states: ActivityFeedState[] = [];
	private static _currentState: ActivityFeedState;

	static bootstrap( items?: ActivityFeedInput[], options?: BootstrapOptions )
	{
		const url = History.futureState
			? History.futureState.fullPath
			: router.currentRoute.fullPath;

		const inHistorical = options && options.inHistorical || History.inHistorical;

		// If we're bootstrapping in historical, just return what we had.
		// We only do this if we are going back to the latest state that we have
		// stored items for.
		if ( inHistorical ) {
			const state = this._states.find( ( item ) => item.url === url );
			if ( state ) {
				this._currentState = state;
				return this._currentState.container;
			}
		}

		// If items passed in were null then they were trying to pull from
		// cache. Since we got here we don't have any cached state, so return
		// null.
		if ( !items || !options ) {
			return null;
		}

		// If we're not going back/forward in history, but rather a new page
		// then always bootstrap a new state container. This will clear out any
		// historical ones for this URL.
		const index = this._states.findIndex( ( item ) => item.url === url );
		if ( index !== -1 ) {
			this._states.splice( 0, index );
		}

		this._currentState = {
			url,
			container: new ActivityFeedContainer( items, options ),
		};

		// Keep it trimmed.
		this._states.unshift( this._currentState );
		this._states = this._states.slice( 0, MAX_CACHED_COUNT );

		return this._currentState.container;
	}
}
