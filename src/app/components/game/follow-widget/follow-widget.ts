import { provide } from 'ng-metadata/core';
import { FollowWidgetComponent } from './follow-widget-directive';

export default angular.module( 'App.Game.FollowWidget', [] )
.directive( ...provide( FollowWidgetComponent ) )
.name;
