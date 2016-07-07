import { provide } from 'ng-metadata/core';
import { ActivityCtrl } from './activity-controller';

import Feed from './feed/feed';

export default angular.module( 'App.Views.Dashboard.Activity', [
	Feed,
] )
.controller( ...provide( 'Dashboard.ActivityCtrl', { useClass: ActivityCtrl } ) )
.name;
