angular.module( 'App' ).controller( 'AppCtrl', function( $scope, $state, App, Meta, Screen, Environment, Scroll, Shell, Connection )
{
	$scope.$state = $state;
	$scope.App = App;
	$scope.Meta = Meta;
	$scope.Screen = Screen;
	$scope.Environment = Environment;
	$scope.Scroll = Scroll;
	$scope.Shell = Shell;
	$scope.Connection = Connection;
} );
