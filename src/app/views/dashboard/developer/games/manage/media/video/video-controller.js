angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Media.VideoCtrl', function( $scope, $state, $translate, Translate, Game_Video, ModalConfirm, Growls, payload )
{
	Translate.pageTitle( 'dash.games.media.video.page_title', { game: $scope.manageCtrl.game.title } );

	this.video = new Game_Video( payload.video );

	this.remove = function()
	{
		var video = this.video;

		ModalConfirm.show( $translate.instant( 'dash.games.media.video.remove_confirmation' ) ).then( function()
		{
			return video.$remove();
		} )
		.then( function()
		{
			Translate.growl( 'success', 'dash.games.media.video.removed' );
			$state.go( '^.list' );
		} );
	};
} );
