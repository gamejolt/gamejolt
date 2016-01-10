angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Media.ImageCtrl', function( $scope, $state, $translate, Translate, Game_Screenshot, ModalConfirm, Growls, payload )
{
	Translate.pageTitle( 'dash.games.media.image.page_title', { game: $scope.manageCtrl.game.title } );

	this.image = new Game_Screenshot( payload.image );

	this.remove = function()
	{
		var image = this.image;

		ModalConfirm.show( $translate.instant( 'dash.games.media.image.remove_confirmation' ) ).then( function()
		{
			return image.$remove();
		} )
		.then( function()
		{
			Translate.growl( 'success', 'dash.games.media.image.removed' );
			$state.go( '^.list' );
		} );
	};
} );
