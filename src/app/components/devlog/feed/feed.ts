import { provide } from 'ng-metadata/core';
import { DevlogFeed } from './feed-directive';

export default angular.module( 'App.Devlog.Feed', [] )
.directive( ...provide( DevlogFeed ) )
.name;
