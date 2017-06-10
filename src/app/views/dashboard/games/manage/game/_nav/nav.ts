import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./nav.html?style=./nav.styl';

import { RouteState, RouteStore, RouteAction } from '../../manage.state';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { AppManageGameNavRequired } from './required';

@View
@Component({
	components: {
		AppManageGameNavRequired,
	},
})
export class AppManageGameNav extends Vue
{
	@RouteState game: RouteStore['game'];
	@RouteState isWizard: RouteStore['isWizard'];
	@RouteState canPublish: RouteStore['canPublish'];

	@RouteAction saveDraft: RouteStore['saveDraft'];
	@RouteAction publish: RouteStore['publish'];

	Game = Game;
}
