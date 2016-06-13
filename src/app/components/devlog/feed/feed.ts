import { provide } from 'ng-metadata/core';
import { DevlogFeed } from './feed-directive';

export const DevlogFeedModule = angular.module( 'App.Devlog.Feed', [] )
.directive( ...provide( DevlogFeed ) )
.name
;
