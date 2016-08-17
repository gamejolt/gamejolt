angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.KeyGroups.ListCtrl', function(
	$scope, $state, App, KeyGroup, Game_Package, gettextCatalog, payload )
{
	var _this = this;
	var manageCtrl = $scope.manageCtrl;

	$scope.KeyGroup = KeyGroup;

	this.keyGroups = KeyGroup.populate( payload.keyGroups );
	this.packages = Game_Package.populate( payload.packages );

	App.title = gettextCatalog.getString( 'Manage Key Groups for {{ game }}', { game: manageCtrl.game.title } );

	this.onKeyGroupAdded = function( keyGroup )
	{
		$state.go( 'dashboard.developer.games.manage.key-groups.edit', { keyGroupId: keyGroup.id } );
	};
} );
