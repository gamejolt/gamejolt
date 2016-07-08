import { provide } from 'ng-metadata/core';
import { FeedComponent } from './feed-directive';
import { ItemComponent } from './item-directive';
import { NotificationComponent } from './notification-directive';
import { ActivityFeedService } from './feed-service';

export default angular.module( 'App.Activity.Feed', [] )
.directive( ...provide( FeedComponent ) )
.directive( ...provide( ItemComponent ) )
.directive( ...provide( NotificationComponent ) )
.service( ...provide( 'ActivityFeedService', { useClass: ActivityFeedService } ) )
.name;
