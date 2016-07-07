import { provide } from 'ng-metadata/core';
import { DescriptiveActionComponent } from './descriptive-action-directive';

export default angular.module( 'App.Notification.DescriptiveAction', [] )
.directive( ...provide( DescriptiveActionComponent ) )
.name;
