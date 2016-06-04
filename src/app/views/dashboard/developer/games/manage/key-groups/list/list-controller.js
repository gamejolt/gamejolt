angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.KeyGroups.ListCtrl', function(
	$scope, App, KeyGroup, Game_Package, gettextCatalog, payload )
{
	var _this = this;

	$scope.KeyGroup = KeyGroup;

	this.keyGroups = KeyGroup.populate( payload.keyGroups );
	this.packages = Game_Package.populate( payload.packages );

	var manageCtrl = $scope.manageCtrl;
	App.title = 'Manage Key Groups for {{ manageCtrl.game.title }}';  // gettextCatalog.getString('' , { game: manageCtrl.game.title } );

	this.onKeyGroupAdded = function( keyGroup )
	{
		this.keyGroups.push( keyGroup );
		this.isAdding = false;
	};
} );
