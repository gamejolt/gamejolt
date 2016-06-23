import { Injectable, Inject } from 'ng-metadata/core';
import { Channels_ViewHelper } from './../../channels-view-helper';

@Injectable()
export class OverviewCtrl
{
	bestGames: any[];
	hotGames: any[];

	constructor(
		@Inject( '$stateParams' ) $stateParams: ng.ui.IStateParamsService,
		@Inject( 'Game' ) Game: any,
		@Inject( 'Channels_ViewHelper' )Channels_ViewHelper: Channels_ViewHelper,
		@Inject( 'payload' ) payload: any
	)
	{
		this.bestGames = Game.populate( payload.bestGames );
		this.hotGames = Game.populate( payload.hotGames );

		Channels_ViewHelper.setDefaultMetaData( $stateParams['channel'] );
	}
}
