import { provide } from 'ng-metadata/core';
import { NotificationCountComponent } from './notification-count-directive';

export default angular.module( 'App.Activity.NotificationCount', [] )
.directive( ...provide( NotificationCountComponent ) )
.name;
