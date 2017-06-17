import { SiteDomainFormFactory } from './domain-directive';

export default angular
	.module('App.Forms.Dashboard.Site.Domain', [])
	.directive('gjFormDashboardSiteDomain', SiteDomainFormFactory).name;
