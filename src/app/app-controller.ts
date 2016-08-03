export class AppCtrl
{
	constructor(
		$scope: any,
		$state: any,
		App: any,
		Meta: any,
		Screen: any,
		Environment: any,
		Scroll: any,
		Shell: any,
		Connection: any,
	)
	{
		$scope.$state = $state;
		$scope.App = App;
		$scope.Meta = Meta;
		$scope.Screen = Screen;
		$scope.Environment = Environment;
		$scope.Scroll = Scroll;
		$scope.Shell = Shell;
		$scope.Connection = Connection;
	}
}
