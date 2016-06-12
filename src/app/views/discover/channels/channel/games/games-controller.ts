import { Channels_ViewHelper } from '../../channels-view-helper';

export class GamesCtrl
{
	gamesCount = 0;
	perPage = 10;
	currentPage = 1;
	section = 'hot';

	/*@ngInject*/
	constructor( private Channels_ViewHelper: Channels_ViewHelper, public filteringContainer )
	{
	}

	processPayload( $stateParams, payload )
	{
		this.gamesCount = payload.gamesCount;
		this.perPage = payload.perPage;
		this.currentPage = $stateParams.page || 1;
		this.section = $stateParams.section;

		this.Channels_ViewHelper.setDefaultMetaData( $stateParams.channel );
	}
}
