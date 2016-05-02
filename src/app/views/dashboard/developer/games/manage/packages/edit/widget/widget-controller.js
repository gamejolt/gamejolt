angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Edit.WidgetCtrl', function(
	$scope, $sce, $state, Environment, Sellable, widgetPayload )
{
	var _this = this;

	this.sellable = widgetPayload.sellable ? new Sellable( widgetPayload.sellable ) : null;

	var widgetUrl = Environment.widgetHost + '/?key=' + this.sellable.key;
	this.widgetUrl = $sce.trustAsResourceUrl( widgetUrl );
	this.widgetCode = '<iframe src="' + widgetUrl + '" frameborder="0" width="500" height="245"></iframe>';
} );
