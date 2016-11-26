import { provide } from 'ng-metadata/core';
import { SiteAnalytics } from './site-analytics-service';
import { ReportFactory } from './report-service';

export default angular.module( 'App.SiteAnalytics', [] )
.factory( 'SiteAnalyticsReport', ReportFactory )
.service( ...provide( 'SiteAnalytics', { useClass: SiteAnalytics } ) )
.name;
