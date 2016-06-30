angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Media.ImageCtrl', function( $scope, $state, App, Game_Screenshot, ModalConfirm, Growls, gettextCatalog, payload )
{
	App.title = gettextCatalog.getString( 'dash.games.media.image.page_title', { game: $scope.manageCtrl.game.title } );

	this.image = new Game_Screenshot( payload.image );

	this.remove = function()
	{
		var image = this.image;

		ModalConfirm.show( gettextCatalog.getString( 'dash.games.media.image.remove_confirmation' ) ).then( function()
		{
			return image.$remove();
		} )
		.then( function()
		{
			Growls.success(
				gettextCatalog.getString( 'dash.games.media.image.removed_growl' ),
				gettextCatalog.getString( 'dash.games.media.image.removed_growl_title' )
			);
			$state.go( '^.list' );
		} );
	};
} );
