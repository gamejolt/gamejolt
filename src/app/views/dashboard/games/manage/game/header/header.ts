import { Component } from 'vue-property-decorator';
import * as View from '!view!./header.html';

import { Popover } from '../../../../../../../lib/gj-lib-client/components/popover/popover.service';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { RouteState, RouteStore } from '../../manage.store';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormGameHeader } from '../../../../../../components/forms/game/header/header';
import { AppDashGameWizardControls } from '../../../../../../components/forms/game/wizard-controls/wizard-controls';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageGameHeader',
	components: {
		AppJolticon,
		FormGameHeader,
		AppDashGameWizardControls,
	},
})
export default class RouteDashGamesManageGameHeader extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Edit Header for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	async clearHeader() {
		Popover.hideAll();

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove your game header?`),
			undefined,
			'yes'
		);

		if (result) {
			this.game.$clearHeader();
		}
	}

	onSaved() {
		Growls.success(
			this.$gettext('dash.games.header.saved_growl'),
			this.$gettext('dash.games.header.saved_growl_title')
		);
		Scroll.to(0);
	}
}
