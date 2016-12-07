import Developer from './developer/developer';
import Activity from './activity/activity';
import Analytics from './analytics/analytics';
import FormsModule from './../../components/forms/dashboard/dashboard';

angular.module( 'App.Views.Dashboard', [
	Developer,
	Activity,
	Analytics,
	FormsModule,
] );
