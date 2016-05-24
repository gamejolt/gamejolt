angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Edit.KeyGroups.ListCtrl', function(
	$scope, $state, App, Game_Package, Sellable, ModalConfirm, Growls, gettextCatalog, keyGroupsPayload )
{
	console.log(keyGroupsPayload);
	//var _this = this;
	//var manageCtrl = $scope.manageCtrl;
	this.sellable = keyGroupsPayload.sellable;
	this.keyGroups = keyGroupsPayload.keyGroups;
	//App.title = gettextCatalog.getString( 'Manage Key Groups for {{ game }}', { game: manageCtrl.game.title } );

} );
