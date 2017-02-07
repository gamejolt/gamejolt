import { provide } from 'ng-metadata/core';
import { FriendRequestPopoverComponent } from './request-popover-directive';

export default angular.module( 'App.Friend.RequestPopover', [] )
.directive( ...provide( FriendRequestPopoverComponent ) )
.name;
