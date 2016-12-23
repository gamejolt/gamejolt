import Developer from './developer/developer';
import Activity from './activity/activity';
import Analytics from './analytics/analytics';
import FormsModule from './../../components/forms/dashboard/dashboard';
import TimezoneModule from '../../../lib/gj-lib-client/components/timezone/timezone';

angular.module( 'App.Views.Dashboard', [
	'gj.DateHelper',
	'gj.DatetimePicker',
	'ngTimezone',

	Developer,
	Activity,
	Analytics,
	FormsModule,
	TimezoneModule,
] );
