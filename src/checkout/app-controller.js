angular.module( 'App' ).controller( 'AppCtrl', function( $scope, $state, App, Screen, Environment )
{
	$scope.$state = $state;
	$scope.App = App;
	$scope.Screen = Screen;
	$scope.Environment = Environment;
} );
