angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Media.VideoCtrl', function( $scope, $state, App, Game_Video, ModalConfirm, Growls, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'dash.games.media.video.page_title', { game: $scope.manageCtrl.game.title } );

	this.video = new Game_Video( payload.video );

	this.remove = function()
	{
		var video = this.video;

		ModalConfirm.show( gettextCatalog.getString( 'dash.games.media.video.remove_confirmation' ) ).then( function()
		{
			return video.$remove();
		} )
		.then( function()
		{
			Growls.success(
				gettextCatalog.getString( 'dash.games.media.video.removed_growl' ),
				gettextCatalog.getString( 'dash.games.media.video.removed_growl_title' )
			);
			$state.go( '^.list' );
		} );
	};
} );
