import { Injectable, Inject } from 'ng-metadata/core';
import { ActivityFeedItem, ActivityFeedInput } from './item-service';
import { ActivityFeedContainer } from './feed-container-service';

export interface BootstrapOptions
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

@Injectable()
export class ActivityFeedService
{
	private _states: ActivityFeedState[] = [];
	private _currentState: ActivityFeedState;

	constructor(
		@Inject( 'History' ) private history: any,
		@Inject( 'ActivityFeedContainer' ) private containerModel: typeof ActivityFeedContainer,
		@Inject( '$state' ) private $state: angular.ui.IStateService,
		@Inject( '$stateParams' ) private $stateParams: angular.ui.IStateParamsService
	)
	{
	}

	bootstrap( items: ActivityFeedInput[], options: BootstrapOptions = {} )
	{
		const url = this.history.futureState
			? this.$state.href( this.history.futureState[0], this.history.futureState[1] )
			: this.$state.href( this.$state.current, this.$stateParams );

		const inHistorical = options.inHistorical || this.history.inHistorical;

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
			container: new ActivityFeedContainer( items ),
		};
		this._states.push( this._currentState );

		return this._currentState.container;
	}
}
