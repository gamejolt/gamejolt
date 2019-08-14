import { Growls } from '../../../../../../../_common/growls/growls.service';
import { BaseRouteComponent } from '../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { AppState, AppStore } from '../../../../../../../_common/store/app-store';
import { Component } from 'vue-property-decorator';
import AppGameDevStageSelector from '../../../../../../components/forms/game/dev-stage-selector/dev-stage-selector.vue';
import FormGame from '../../../../../../components/forms/game/game.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Component({
	name: 'RouteDashGamesManageGameDetails',
	components: {
		FormGame,
		AppGameDevStageSelector,
	},
})
export default class RouteDashGamesManageGameDetails extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	isWizard!: RouteStore['isWizard'];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Edit Details for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	get isCollaborator() {
		return this.user!.id !== this.game.developer.id;
	}

	onSaved() {
		Growls.success(
			this.$gettext('dash.games.edit.save_growl'),
			this.$gettext('dash.games.edit.save_growl_title')
		);

		Scroll.to(0);
	}
}
