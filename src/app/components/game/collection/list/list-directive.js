angular.module( 'App.Game.Collection.List' ).directive( 'gjGameCollectionList', function()
{
	return {
		restrict: 'E',
		scope: {
			collections: '=gjGameCollections',
			eventLabel: '@?gjEventLabel',
		},
		template: require( '!html-loader!./list.html' ),
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, App )
		{
			$scope.App = App;
		}
	};
} );
