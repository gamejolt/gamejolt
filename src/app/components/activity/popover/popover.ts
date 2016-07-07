import { provide } from 'ng-metadata/core';
import { PopoverComponent } from './popover-directive';

export default angular.module( 'App.Notifications.Popover', [] )
.directive( ...provide( PopoverComponent ) )
.name;
