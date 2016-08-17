import { provide } from 'ng-metadata/core';
import { FeedComponent } from './feed-directive';
import { NotificationComponent } from './notification/notification-directive';
import { ActivityFeedService } from './feed-service';
import { ActivityFeedItemFactory } from './item-service';
import { ActivityFeedContainerFactory } from './feed-container-service';
import { ControlsComponent } from './devlog-post/controls/controls-directive';
import { DevlogPostComponent } from './devlog-post/devlog-post-directive';
import { MediaComponent } from './devlog-post/media/media-directive';
import { TextComponent } from './devlog-post/text/text-directive';
import { VideoComponent } from './devlog-post/video/video-directive';

export default angular.module( 'App.Activity.Feed', [] )
.factory( 'ActivityFeedItem', ActivityFeedItemFactory )
.factory( 'ActivityFeedContainer', ActivityFeedContainerFactory )
.directive( ...provide( FeedComponent ) )
.directive( ...provide( NotificationComponent ) )
.directive( ...provide( DevlogPostComponent ) )
.directive( ...provide( MediaComponent ) )
.directive( ...provide( TextComponent ) )
.directive( ...provide( VideoComponent ) )
.directive( ...provide( ControlsComponent ) )
.service( ...provide( 'ActivityFeedService', { useClass: ActivityFeedService } ) )
.name;
