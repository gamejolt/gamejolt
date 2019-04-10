import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component } from 'vue-property-decorator';
import FormGameSettings from '../../../../../../components/forms/game/settings/settings.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageGameSettings',
	components: {
		FormGameSettings,
		AppExpand,
	},
})
export default class RouteDashGamesManageGameSettings extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	isWizard!: RouteStore['isWizard'];

	@RouteStoreModule.Action
	cancel!: RouteStore['cancel'];

	@RouteStoreModule.Action
	hide!: RouteStore['hide'];

	@RouteStoreModule.Action
	removeGame!: RouteStore['removeGame'];

	@RouteStoreModule.Action
	leaveProject!: RouteStore['leaveProject'];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Settings for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	get isHidden() {
		return this.game.status === Game.STATUS_HIDDEN;
	}

	get isCanceled() {
		return this.game.canceled;
	}

	get isCollaborator() {
		return this.user!.id !== this.game.developer.id;
	}

	onSaved() {
		Growls.success(
			this.$gettext('dash.games.settings.save_growl'),
			this.$gettext('dash.games.settings.save_growl_title')
		);
		Scroll.to(0);
	}
}
