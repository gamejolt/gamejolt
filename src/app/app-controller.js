angular.module( 'App' ).controller( 'AppCtrl', function( $scope, $state, $translate, App, Meta, Screen, Environment, Scroll, Shell, Connection )
{
	$scope.$state = $state;
	$scope.$translate = $translate;
	$scope.App = App;
	$scope.Meta = Meta;
	$scope.Screen = Screen;
	$scope.Environment = Environment;
	$scope.Scroll = Scroll;
	$scope.Shell = Shell;
	$scope.Connection = Connection;
} );
