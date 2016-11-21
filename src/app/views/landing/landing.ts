import Learn from './learn/learn';
import About from './about/about';
import Partners from './partners/partners';
import Marketplace from './marketplace/marketplace';
import GameApi from './game-api/game-api';
import GameApiDoc from './game-api-doc/game-api-doc';

export default angular.module( 'App.Views.Landing', [
	Learn,
	About,
	Partners,
	Marketplace,
	GameApi,
	GameApiDoc,
] )
.name;
