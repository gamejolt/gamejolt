export class AppCtrl
{
	constructor( $scope, $state, $injector, App, Screen, Environment )
	{
		$scope.$state = $state;
		$scope.App = App;
		$scope.Screen = Screen;
		$scope.Environment = Environment;

		if ( Environment.isClient ) {
			$scope.HistoryNavigator = $injector.get( 'HistoryNavigator' );
		}
	}
}
