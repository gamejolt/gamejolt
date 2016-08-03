import Profile from './profile/profile';
import Discover from './discover/discover';
import Landing from './landing/landing';

export default angular.module( 'App.Views', [
	Discover,
	Profile,
	Landing,
] )
.name;
