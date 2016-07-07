import Manage from './developer/games/manage/manage';
import Activity from './activity/activity';
import FormsModule from './../../components/forms/dashboard/dashboard';

angular.module( 'App.Views.Dashboard', [
	Activity,
	Manage,
	FormsModule,
] );
