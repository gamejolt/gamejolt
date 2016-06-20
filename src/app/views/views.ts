import Profile from './profile/profile';
import Discover from './discover/discover';

export default angular.module( 'App.Views', [
	Discover,
	Profile,
] )
.name;
