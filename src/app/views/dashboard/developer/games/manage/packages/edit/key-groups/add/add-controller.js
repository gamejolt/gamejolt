angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Edit.KeyGroups.AddCtrl', function(
	$scope, $sce, $state, Environment, Sellable, Sellable_KeyGroup, Key )
{
	var _this = this;

	this.onKeyGroupAdded = function( formModel )
	{
		console.log('onKeyGroupAdded');
		console.log( formModel );
		//$state.go( 'dashboard.developer.games.manage.packages.edit.keygroups.edit', { sellableId: formModel.sellable_id, keyGroupId: formModel.id } );
	};

} );
