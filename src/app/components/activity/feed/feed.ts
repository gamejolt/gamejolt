import { provide } from 'ng-metadata/core';
import { FeedComponent } from './feed-directive';
import { NotificationComponent } from './notification-directive';
import { ActivityFeedService } from './feed-service';
import { ActivityFeedItemFactory } from './item-service';
import { ActivityFeedContainerFactory } from './feed-container-service';

export default angular.module( 'App.Activity.Feed', [] )
.factory( 'ActivityFeedItem', ActivityFeedItemFactory )
.factory( 'ActivityFeedContainer', ActivityFeedContainerFactory )
.directive( ...provide( FeedComponent ) )
.directive( ...provide( NotificationComponent ) )
.service( ...provide( 'ActivityFeedService', { useClass: ActivityFeedService } ) )
.name;
