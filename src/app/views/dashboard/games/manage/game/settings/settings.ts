import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import AppExpand from '../../../../../../../_common/expand/expand.vue';
import { Game } from '../../../../../../../_common/game/game.model';
import { showSuccessGrowl } from '../../../../../../../_common/growls/growls.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import FormGameSettings from '../../../../../../components/forms/game/settings/settings.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameSettings',
	components: {
		FormGameSettings,
		AppExpand,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	resolver: ({ route }) =>
		Api.sendRequest(`/web/dash/developer/games/settings/view/${route.params.id}`),
})
export default class RouteDashGamesManageGameSettings extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

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

	hasCompetitionEntries = false;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Settings for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	get isUnlisted() {
		return this.game.status === Game.STATUS_HIDDEN;
	}

	get isCanceled() {
		return this.game.canceled;
	}

	get isCollaborator() {
		return this.user!.id !== this.game.developer.id;
	}

	routeResolved($payload: any) {
		this.hasCompetitionEntries = $payload.hasCompetitionEntries;
	}

	onSaved() {
		showSuccessGrowl(
			this.$gettext('dash.games.settings.save_growl'),
			this.$gettext('dash.games.settings.save_growl_title')
		);
		Scroll.to(0);
	}
}
