import { StateService, StateParams } from 'angular-ui-router';

import { ActivityFeedInput } from './item-service';
import { ActivityFeedContainer } from './feed-container-service';
import { getProvider } from '../../../../lib/gj-lib-client/utils/utils';

/**
 * Number of states we will keep cached.
 * We will purge others out of the cache.
 */
const MAX_CACHED_COUNT = 3;

export interface BootstrapOptions
{
	/**
	 * Override to say if it's a historical bootstrap or not.
	 * Useful if you are lazy loading the page.
	 */
	inHistorical?: boolean;

	/**
	 * A timestamp of when the notifications in this feed were last viewed.
	 */
	notificationWatermark?: number;
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

	static bootstrap( items: ActivityFeedInput[], options: BootstrapOptions = {} )
	{
		const History = getProvider<any>( 'History' );
		const $state = getProvider<StateService>( '$state' );
		const $stateParams = getProvider<StateParams>( '$stateParams' );

		const url = History.futureState
			? $state.href( History.futureState[0], History.futureState[1] )
			: $state.href( $state.current, $stateParams );

		const inHistorical = options.inHistorical || History.inHistorical;

		// If we're bootstrapping in historical, just return what we had.
		// We only do this if we are going back to the latest state that we have
		// stored items for.
		if ( inHistorical ) {
			const state = _.find( this._states, { url } );
			if ( state ) {
				this._currentState = state;
				return this._currentState.container;
			}
		}

		// If we're not going back/forward in history, but rather a new page
		// then always bootstrap a new state container. This will clear out any
		// historical ones for this URL.
		_.remove( this._states, { url } );
		this._currentState = {
			url,
			container: new ActivityFeedContainer( items, options.notificationWatermark ),
		};
		this._states.unshift( this._currentState );
		this._states = this._states.slice( 0, MAX_CACHED_COUNT );

		return this._currentState.container;
	}
}
