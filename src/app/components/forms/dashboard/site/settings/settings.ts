import { SiteSettingsFormFactory } from './settings-directive';

export default angular.module( 'App.Forms.Dashboard.Site.Settings', [] )
.directive( 'gjFormDashboardSiteSettings', SiteSettingsFormFactory )
.name
;
