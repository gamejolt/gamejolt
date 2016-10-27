import { provide } from 'ng-metadata/core';
import { AnalyticsCtrl } from './analytics-controller';

import SiteAnalytics from '../../../components/site-analytics/site-analytics';
import { RatingBreakdownComponent } from './_report/rating-breakdown-directive';
import { SimpleStatComponent } from './_report/simple-stat-directive';
import { TopCompositionComponent } from './_report/top-composition-directive';
import { TopCompositionValueComponent } from './_report/top-composition-value-directive';

export default angular.module( 'App.Views.Dashboard.Analytics', [
	SiteAnalytics,
] )
.controller( ...provide( 'Dashboard.AnalyticsCtrl', { useClass: AnalyticsCtrl } ) )
.directive( ...provide( RatingBreakdownComponent ) )
.directive( ...provide( SimpleStatComponent ) )
.directive( ...provide( TopCompositionComponent ) )
.directive( ...provide( TopCompositionValueComponent ) )
.name;
