angular.module( 'App.Game.Collection.Grid' ).directive( 'gjGameCollectionGrid', function()
{
	return {
		restrict: 'E',
		scope: {
			collections: '=gjGameCollections',
			eventLabel: '@?gjEventLabel',
		},
		template: require( '!html-loader!./grid.html' ),
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, App )
		{
			$scope.App = App;
		}
	};
} );
