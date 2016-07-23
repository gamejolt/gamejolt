import { provide } from 'ng-metadata/core';
import { FeedComponent } from './feed-directive';
import { NotificationComponent } from './notification/notification-directive';
import { ActivityFeedService } from './feed-service';
import { ActivityFeedItemFactory } from './item-service';
import { ActivityFeedContainerFactory } from './feed-container-service';
import { ControlsComponent } from './devlog-post/controls/controls-directive';
import { MediaComponent } from './devlog-post/media/media-directive';
import { VideoComponent } from './devlog-post/media/video-directive';
import { TextComponent } from './devlog-post/text/text-directive';

export default angular.module( 'App.Activity.Feed', [] )
.factory( 'ActivityFeedItem', ActivityFeedItemFactory )
.factory( 'ActivityFeedContainer', ActivityFeedContainerFactory )
.directive( ...provide( FeedComponent ) )
.directive( ...provide( NotificationComponent ) )
.directive( ...provide( ControlsComponent ) )
.directive( ...provide( MediaComponent ) )
.directive( ...provide( VideoComponent ) )
.directive( ...provide( TextComponent ) )
.service( ...provide( 'ActivityFeedService', { useClass: ActivityFeedService } ) )
.name;
