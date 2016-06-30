import Game from './game/game';
import GameDescription from './game/description/description';
import GameDevlogPost from './game/devlog-post/devlog-post';

export default angular.module( 'App.Forms.Dashboard', [
	Game,
	GameDevlogPost,
	GameDescription,
] )
.name;
