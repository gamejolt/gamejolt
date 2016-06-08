export class OverviewCtrl
{
	bestGames: any[];
	hotGames: any[];

	constructor( $stateParams, Game, Channels_ViewHelper, payload )
	{
		this.bestGames = Game.populate( payload.bestGames );
		this.hotGames = Game.populate( payload.hotGames );

		Channels_ViewHelper.setDefaultMetaData( $stateParams.channel );
	}
}
