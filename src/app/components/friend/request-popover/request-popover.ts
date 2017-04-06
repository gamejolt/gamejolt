import { provide } from 'ng-metadata/core';
import { RequestPopoverComponent } from './request-popover-directive';

export default angular.module( 'App.Friend.RequestPopover', [] )
.directive( ...provide( RequestPopoverComponent ) )
.name;
