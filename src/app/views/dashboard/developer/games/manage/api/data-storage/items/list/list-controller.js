angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Api.DataStorage.Items.ListCtrl', function(
	$scope, $translate, Translate, Game_DataStore_Item, ModalConfirm, payload )
{
	var _this = this;

	Translate.pageTitle( 'dash.games.data_store.items.page_title', { game: $scope.manageCtrl.game.title } );

	this.items = Game_DataStore_Item.populate( payload.items );

	this.removeItem = function( item )
	{
		ModalConfirm.show( $translate.instant( 'dash.games.data_store.items.remove_confirmation' ) )
			.then( function()
			{
				return item.$remove();
			} )
			.then( function()
			{
				_.remove( _this.items, { id: item.id } );
			} );
	};
} );
