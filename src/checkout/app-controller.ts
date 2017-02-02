import { getProvider } from '../lib/gj-lib-client/utils/utils';

export class AppCtrl
{
	constructor(
		$scope: any,
		$state: any,
		App: any,
		Screen: any,
		Environment: any,
	)
	{
		$scope.$state = $state;
		$scope.App = App;
		$scope.Screen = Screen;
		$scope.Environment = Environment;

		if ( GJ_IS_CLIENT ) {
			$scope.HistoryNavigator = getProvider<any>( 'HistoryNavigator' );
		}
	}
}
