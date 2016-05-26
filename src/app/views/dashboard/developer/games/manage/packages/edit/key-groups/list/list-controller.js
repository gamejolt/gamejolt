angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Edit.KeyGroups.ListCtrl', function(
	$scope, $state, App, Api, Game_Package, Sellable, ModalConfirm, Growls, gettextCatalog, keyGroupsPayload )
{
	var _this = this;

	this.sellable = keyGroupsPayload.sellable;
	this.keyGroups = keyGroupsPayload.keyGroups;
	this.invitedUsers = keyGroupsPayload.invitedUsers;

	var manageCtrl = $scope.manageCtrl;
	App.title = 'Manage Key Groups for {{ manageCtrl.game.title }}';  // gettextCatalog.getString('' , { game: manageCtrl.game.title } );

	this.inviteUser = function( userId ) {
		Api.sendRequest( '/web/dash/developer/sellables/key-groups/invite-user/' + _this.sellable.id + '/' + userId ).then( function( payload )
		{
			Growls.success( 'invited', 'Success' );
			_this.invitedUsers.push( payload.invitedUser );
		} );
	}

	this.uninviteUser = function( userId ) {
		Api.sendRequest( '/web/dash/developer/sellables/key-groups/uninvite-user/' + _this.sellable.id + '/' + userId ).then( function( payload )
		{
			Growls.success( 'uninvited!', 'Success' );
			_.remove( _this.invitedUsers, { user_id: userId } );
		} );
	}


} );
