import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./header.html';

import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Popover } from '../../../../../../../lib/gj-lib-client/components/popover/popover.service';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { RouteState, RouteStore } from '../../manage.state';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormGameHeader } from '../../../../../../components/forms/game/header/header';

@View
@Component({
	components: {
		AppJolticon,
		FormGameHeader,
	},
})
export default class RouteDashGamesManageGameHeader extends Vue {
	@RouteState game: RouteStore['game'];
	@RouteState isWizard: RouteStore['isWizard'];

	created() {
		Meta.title = this.$gettextInterpolate('Edit Header for %{ game }', {
			game: this.game.title,
		});
	}

	async clearHeader() {
		Popover.hideAll();

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove your game header?`),
			undefined,
			'yes',
		);

		if (result) {
			this.game.$clearHeader();
		}
	}

	onSaved() {
		Growls.success(
			this.$gettext('dash.games.header.saved_growl'),
			this.$gettext('dash.games.header.saved_growl_title'),
		);
		Scroll.to(0);
	}
}
