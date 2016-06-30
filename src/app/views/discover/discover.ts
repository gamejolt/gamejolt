import Home from './home/home';
import Devlogs from './devlogs/devlogs';
import GameDevlog from './games/view/devlog/devlog';

export default angular.module( 'App.Views.Discover', [
	Home,
	Devlogs,
	GameDevlog,
] )
.name;
