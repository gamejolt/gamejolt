import View from '!view!./nav.html?style=./nav.styl';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';
import { RouteAction, RouteState, RouteStore } from '../../manage.store';
import { AppManageGameNavRequired } from './required';

@View
@Component({
	components: {
		AppManageGameNavRequired,
		AppGamePerms,
	},
})
export class AppManageGameNav extends Vue {
	@RouteState
	game!: RouteStore['game'];

	@RouteState
	isWizard!: RouteStore['isWizard'];

	@RouteState
	canPublish!: RouteStore['canPublish'];

	@RouteAction
	saveDraft!: RouteStore['saveDraft'];

	@RouteAction
	publish!: RouteStore['publish'];

	@State
	app!: AppStore;

	Game = Game;
}
