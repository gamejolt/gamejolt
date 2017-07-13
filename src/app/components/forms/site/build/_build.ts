import { SiteBuildFormFactory } from './build-directive';

export default angular
	.module('App.Forms.Dashboard.Site.Build', [])
	.directive('gjFormDashboardSiteBuild', SiteBuildFormFactory).name;
