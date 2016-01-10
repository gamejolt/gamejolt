angular.module( 'App' ).controller( 'AppCtrl', function( $scope, $state, App, Screen, Environment, Connection )
{
	$scope.$state = $state;
	$scope.App = App;
	$scope.Screen = Screen;
	$scope.Environment = Environment;
	$scope.Connection = Connection;
} );
