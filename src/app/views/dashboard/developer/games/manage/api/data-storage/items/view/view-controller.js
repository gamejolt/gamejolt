angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Api.DataStorage.Items.ViewCtrl', function(
	$scope, $state, $translate, Translate, Game_DataStore_Item, ModalConfirm, payload )
{
	var _this = this;

	Translate.pageTitle( 'dash.games.data_store.items.view.page_title', { game: $scope.manageCtrl.game.title } );

	this.item = new Game_DataStore_Item( payload.item );

	this.remove = function()
	{
		ModalConfirm.show( $translate.instant( 'dash.games.data_store.items.remove_confirmation' ) )
			.then( function()
			{
				return _this.item.$remove();
			} )
			.then( function()
			{
				$state.go( '^.list' );
			} );
	};
} );
