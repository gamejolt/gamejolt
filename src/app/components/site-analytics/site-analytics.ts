import { provide } from 'ng-metadata/core';
import { SiteAnalytics } from './site-analytics-service';

export default angular.module( 'App.SiteAnalytics', [] )
.service( ...provide( 'SiteAnalytics', { useClass: SiteAnalytics } ) )
.name;
