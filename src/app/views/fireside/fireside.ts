import FiresidePostFeedModule from './../../components/fireside/post/feed/feed';
import FiresidePostTagsListModule from './../../components/fireside/post/tags-list/tags-list';
import Home from './home/home';
import Post from './post/post';
import TagsView from './tags/view/view';

angular.module( 'App.Views.Fireside', [
	FiresidePostFeedModule,
	FiresidePostTagsListModule,
	Home,
	Post,
	TagsView,
] );
