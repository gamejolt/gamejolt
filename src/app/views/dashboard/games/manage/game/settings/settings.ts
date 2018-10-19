import View from '!view!./settings.html?style=./settings.styl';
import { Component } from 'vue-property-decorator';
import { AppExpand } from '../../../../../../../lib/gj-lib-client/components/expand/expand';
import { Game } from '../../../../../../../lib/gj-lib-client/components/game/game.model';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import {
	AppState,
	AppStore,
} from '../../../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { FormGameSettings } from '../../../../../../components/forms/game/settings/settings';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@View
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
