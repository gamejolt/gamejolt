import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./nav.html';

// import { RouteState, RouteStore, RouteAction } from '../../manage.state';
// import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';

@View
@Component({
	// components: {
	// 	AppManageGameNavRequired,
	// },
})
export class AppManageGameApiNav extends Vue
{
	// @RouteState game: RouteStore['game'];
	// @RouteState isWizard: RouteStore['isWizard'];
	// @RouteState canPublish: RouteStore['canPublish'];

	// @RouteAction saveDraft: RouteStore['saveDraft'];
	// @RouteAction publish: RouteStore['publish'];

	// Game = Game;
}
