import View from '!view!./settings.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageApiSettings',
	components: {
		AppJolticon,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/api/settings/' + route.params.id),
})
export default class RouteDashGamesManageApiSettings extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	privateKey = '';
	shouldShowKey = false;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Game API Settings for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.privateKey = $payload.privateKey;
	}

	async generateNewKey() {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.api.settings.generate_confirmation')
		);

		if (!result) {
			return;
		}

		// Make sure it's a POST request.
		const response = await Api.sendRequest(
			'/web/dash/developer/games/api/settings/generate-new-key/' + this.game.id,
			{}
		);

		if (response.newKey) {
			this.privateKey = response.newKey;
			this.shouldShowKey = true;
			Growls.success({
				title: this.$gettext('dash.games.api.settings.generate_growl_title'),
				message: this.$gettext('dash.games.api.settings.generate_growl'),
				sticky: true,
			});
		}
	}
}
