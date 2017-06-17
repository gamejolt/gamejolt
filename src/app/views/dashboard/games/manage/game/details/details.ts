import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./details.html';

import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore } from '../../manage.state';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { FormGame } from '../../../../../../components/forms/game/game';

@View
@Component({
	components: {
		FormGame,
	},
})
export default class RouteDashGamesManageGameDetails extends Vue {
	@RouteState game: RouteStore['game'];
	@RouteState isWizard: RouteStore['isWizard'];

	created() {
		Meta.title = this.$gettextInterpolate('Edit Details for %{ game }', {
			game: this.game.title,
		});
	}

	onSaved() {
		if (this.isWizard) {
			// this.wizard.goNext( this.game );
			return;
		}

		Growls.success(
			this.$gettext('dash.games.edit.save_growl'),
			this.$gettext('dash.games.edit.save_growl_title'),
		);

		Scroll.to(0);
	}
}
