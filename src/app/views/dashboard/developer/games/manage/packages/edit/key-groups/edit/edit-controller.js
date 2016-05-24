angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Edit.KeyGroups.EditCtrl', function(
	$scope, $sce, $state, Environment, Sellable, Sellable_KeyGroup, keyGroupPayload )
{
	var _this = this;

	this.sellable = keyGroupPayload.sellable ? new Sellable( keyGroupPayload.sellable ) : null;
	this.keyGroup = keyGroupPayload.keyGroup ? new Sellable_KeyGroup( keyGroupPayload.keyGroup ) : null;
	this.keys = keyGroupPayload.keys ? keyGroupPayload.keys : [];
} );
