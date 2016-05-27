angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.KeyGroups.ListCtrl', function(
	$scope, App, KeyGroup, Game_Package, gettextCatalog, payload )
{
	var _this = this;

	$scope.KeyGroup = KeyGroup;

	this.keyGroups = KeyGroup.populate( payload.keyGroups );
	this.packages = Game_Package.populate( payload.packages );

	var manageCtrl = $scope.manageCtrl;
	App.title = 'Manage Key Groups for {{ manageCtrl.game.title }}';  // gettextCatalog.getString('' , { game: manageCtrl.game.title } );

	this.isAdding = true;

	// this.onKeyGroupAdded = function( formModel )
	// {
	// 	console.log('onKeyGroupAdded');
	// 	console.log( formModel );
	// 	//$state.go( 'dashboard.developer.games.manage.packages.edit.keygroups.edit', { sellableId: formModel.sellable_id, keyGroupId: formModel.id } );
	// };

	// this.inviteUser = function( userId ) {
	// 	Api.sendRequest( '/web/dash/developer/sellables/key-groups/invite-user/' + _this.sellable.id + '/' + userId ).then( function( payload )
	// 	{
	// 		Growls.success( 'invited', 'Success' );
	// 		_this.invitedUsers.push( payload.invitedUser );
	// 	} );
	// }

	// this.removeUser = function( userId )
	// {
	// 	return Api.sendRequest( '/web/dash/developer/key-groups/uninvite-user/' + _this.sellable.id + '/' + userId ).then( function( payload )
	// 	{
	// 		_.remove( _this.invitedUsers, { user_id: userId } );
	// 	} );
	// }
} );
