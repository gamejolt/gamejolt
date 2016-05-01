angular.module( 'App' ).controller( 'AppCtrl', function( $scope, $state, App, Screen, Environment, HistoryNavigator )
{
	$scope.$state = $state;
	$scope.App = App;
	$scope.Screen = Screen;
	$scope.Environment = Environment;
	$scope.HistoryNavigator = HistoryNavigator;
} );
