import Game from './game/game';
import GameDescription from './game/description/description';
import GameDevlogPost from './game/devlog-post/devlog-post';
import GameDevStageSelector from './game/dev-stage-selector/dev-stage-selector';
import Financials from './financials/financials';

import FiresidePostModule from './fireside/post/post';
import FiresidePostMediaItemModule from './fireside/post-media-item/post-media-item';

export default angular.module( 'App.Forms.Dashboard', [
	Game,
	GameDescription,
	GameDevlogPost,
	GameDevStageSelector,
	Financials,
	FiresidePostModule,
	FiresidePostMediaItemModule,
] )
.name;
