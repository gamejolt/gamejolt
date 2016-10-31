import Home from './home/home';
import GamesList from './games/list/list';
import Devlogs from './devlogs/devlogs';
import DevlogsTag from './devlogs-tag/devlogs-tag';
import GameDevlog from './games/view/devlog/devlog';
import GameComments from './games/view/comments/comments';

export default angular.module( 'App.Views.Discover', [
	Home,
	GamesList,
	Devlogs,
	DevlogsTag,
	GameDevlog,
	GameComments,
] )
.name;
