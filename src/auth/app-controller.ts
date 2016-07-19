export class AppCtrl
{
	constructor(
		$scope: any,
		$state: any,
		App: any,
		Screen: any,
		Environment: any,
		Connection: any,
	)
	{
		$scope.$state = $state;
		$scope.App = App;
		$scope.Screen = Screen;
		$scope.Environment = Environment;
		$scope.Connection = Connection;
	}
}
