import Marketplace from './marketplace/marketplace';
import GameApiDoc from './game-api-doc/game-api-doc';

export default angular.module( 'App.Views.Landing', [
	Marketplace,
	GameApiDoc,
] )
.name;
