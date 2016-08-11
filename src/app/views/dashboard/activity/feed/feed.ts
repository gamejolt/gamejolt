import { provide } from 'ng-metadata/core';
import { FeedCtrl } from './feed-controller';

export default angular.module( 'App.Views.Dashboard.Activity.FeedCtrl', [
] )
.controller( ...provide( 'Dashboard.Activity.FeedCtrl', { useClass: FeedCtrl } ) )
.name;
