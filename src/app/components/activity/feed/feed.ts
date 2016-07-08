import { provide } from 'ng-metadata/core';
import { FeedComponent } from './feed-directive';
import { NotificationComponent } from './notification-directive';
import { ActivityFeedService } from './feed-service';
import { ActivityFeedItemFactory } from './item-service';

export default angular.module( 'App.Activity.Feed', [] )
.factory( 'ActivityFeedItem', ActivityFeedItemFactory )
.directive( ...provide( FeedComponent ) )
.directive( ...provide( NotificationComponent ) )
.service( ...provide( 'ActivityFeedService', { useClass: ActivityFeedService } ) )
.name;
