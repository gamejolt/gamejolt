import { NgModule } from 'ng-metadata/core';
import { ActivityFeedComponent } from './feed-directive';
import { ActivityFeedNotificationComponent } from './notification/notification-directive';
import { ActivityFeedDevlogPostControlsComponent } from './devlog-post/controls/controls-directive';
import { ActivityFeedDevlogPostComponent } from './devlog-post/devlog-post-directive';
import { ActivityFeedDevlogPostMediaComponent } from './devlog-post/media/media-directive';
import { ActivityFeedDevlogPostTextComponent } from './devlog-post/text/text-directive';
import { ActivityFeedDevlogPostVideoComponent } from './devlog-post/video/video-directive';
import { ActivityFeedDevlogPostSketchfabComponent } from './devlog-post/sketchfab/sketchfab.component';
import { ActivityFeedService } from './feed-service';

@NgModule({
	declarations: [
		ActivityFeedComponent,
		ActivityFeedNotificationComponent,
		ActivityFeedDevlogPostComponent,
		ActivityFeedDevlogPostMediaComponent,
		ActivityFeedDevlogPostTextComponent,
		ActivityFeedDevlogPostVideoComponent,
		ActivityFeedDevlogPostSketchfabComponent,
		ActivityFeedDevlogPostControlsComponent,
	],
	providers: [
		{ provide: 'ActivityFeedService', useFactory: () => ActivityFeedService },
	],
})
export class ActivityFeedModule { }
