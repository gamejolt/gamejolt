import Game from './game/game';
import GameDescription from './game/description/description';
import GameDevlogPost from './game/devlog-post/devlog-post';
import GameDevStageSelector from './game/dev-stage-selector/dev-stage-selector';
import GameSketchfab from './game/sketchfab/sketchfab';
import Financials from './financials/financials';
import SiteBuild from './site/build/build';

export default angular.module( 'App.Forms.Dashboard', [
	Game,
	GameDescription,
	GameDevlogPost,
	GameDevStageSelector,
	GameSketchfab,
	Financials,
	SiteBuild,
] )
.name;
