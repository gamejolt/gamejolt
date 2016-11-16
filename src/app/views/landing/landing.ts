import Learn from './learn/learn';
import About from './about/about';
import Marketplace from './marketplace/marketplace';
import GameApi from './game-api/game-api';
import GameApiDoc from './game-api-doc/game-api-doc';

export default angular.module( 'App.Views.Landing', [
	Learn,
	About,
	Marketplace,
	GameApi,
	GameApiDoc,
] )
.name;
