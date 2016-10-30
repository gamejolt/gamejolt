import Marketplace from './marketplace/marketplace';
import GameApi from './game-api/game-api';
import GameApiDoc from './game-api-doc/game-api-doc';

export default angular.module( 'App.Views.Landing', [
	Marketplace,
	GameApi,
	GameApiDoc,
] )
.name;
