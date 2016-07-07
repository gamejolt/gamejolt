import PopoverModule from './popover/popover';
import FeedModule from './feed/feed';

export default angular.module( 'App.Activity', [
	PopoverModule,
	FeedModule,
] )
.name;
