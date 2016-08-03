import Home from './home/home';
import Devlogs from './devlogs/devlogs';
import GameDevlog from './games/view/devlog/devlog';
import GameComments from './games/view/comments/comments';

export default angular.module( 'App.Views.Discover', [
	Home,
	Devlogs,
	GameDevlog,
	GameComments,
] )
.name;
