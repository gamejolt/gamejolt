import FeedModule from './feed/feed';
import NotificationCountModule from './notification-count/notification-count';

export default angular.module( 'App.Activity', [
	FeedModule,
	NotificationCountModule,
] )
.name;
