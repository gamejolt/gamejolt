import { provide } from 'ng-metadata/core';
import { FeedComponent } from './feed-directive';

export default angular.module( 'App.Fireside.Post.Feed', [] )
.directive( ...provide( FeedComponent ) )
.name;
