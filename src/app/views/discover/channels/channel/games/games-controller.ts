import { Injectable, Inject } from 'ng-metadata/core';
import { Channels_ViewHelper } from '../../channels-view-helper';

@Injectable()
export class GamesCtrl
{
	gamesCount = 0;
	perPage = 10;
	currentPage = 1;
	section = 'hot';

	constructor(
		@Inject( 'Channels_ViewHelper' ) private viewHelper: Channels_ViewHelper,
		@Inject( 'filteringContainer' ) public filteringContainer: any
	)
	{
	}

	processPayload( $stateParams, payload )
	{
		this.gamesCount = payload.gamesCount;
		this.perPage = payload.perPage;
		this.currentPage = $stateParams.page || 1;
		this.section = $stateParams.section;

		this.viewHelper.setDefaultMetaData( $stateParams.channel );
	}
}
