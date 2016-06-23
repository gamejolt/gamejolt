import Home from './home/home';
import Devlog from './games/view/devlog/devlog';

export default angular.module( 'App.Views.Discover', [
	Home,
	Devlog,
] )
.name;
