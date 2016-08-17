import Profile from './profile/profile';
import Discover from './discover/discover';
import Landing from './landing/landing';
import Search from './search/search';

export default angular.module( 'App.Views', [
	Discover,
	Profile,
	Landing,
	Search,
] )
.name;
