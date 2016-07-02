import { provide } from 'ng-metadata/core';
import { FeedComponent } from './feed-directive';
import { DevlogFeedService } from './feed-service';

export default angular.module( 'App.Devlog.Feed', [] )
.directive( ...provide( FeedComponent ) )
.service( ...provide( 'DevlogFeedService', { useClass: DevlogFeedService } ) )
.name;
