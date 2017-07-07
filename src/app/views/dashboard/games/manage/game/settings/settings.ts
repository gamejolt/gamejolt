import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./settings.html';

import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore } from '../../manage.state';
import { RouteResolve } from '../../../../../../../lib/gj-lib-client/utils/router';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { FormGameSettings } from '../../../../../../components/forms/game/settings/settings';

@View
@Component({
	components: {
		FormGameSettings,
	},
})
export default class RouteDashGamesManageGameSettings extends Vue {
	@RouteState game: RouteStore['game'];

	@RouteResolve()
	routeResolve(this: undefined) {}

	routed() {
		Meta.title = this.$gettextInterpolate('Settings for %{ game }', {
			game: this.game.title,
		});
	}

	onSaved() {
		// TODO
		// if (this.$scope['manageCtrl'].isWizard) {
		// 	this.wizard.goNext(this.$scope['manageCtrl'].game);
		// 	return;
		// }

		Growls.success(
			this.$gettext('dash.games.settings.save_growl'),
			this.$gettext('dash.games.settings.save_growl_title')
		);
		Scroll.to(0);
	}
}
