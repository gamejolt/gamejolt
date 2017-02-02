import { NgModule } from 'ng-metadata/core';
import { ActivityFeedModule } from './feed/feed';
import { ActivityNotificationCountModule } from './notification-count/notification-count.module';

@NgModule({
	imports: [
		ActivityFeedModule,
		ActivityNotificationCountModule,
	],
})
export class ActivityModule { }
