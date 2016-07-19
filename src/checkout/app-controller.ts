export class AppCtrl
{
	constructor(
		$scope: any,
		$state: any,
		$injector: any,
		App: any,
		Screen: any,
		Environment: any,
	)
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
