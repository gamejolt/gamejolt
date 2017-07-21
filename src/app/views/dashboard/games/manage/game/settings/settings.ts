import { Component } from 'vue-property-decorator';
import * as View from '!view!./settings.html';

import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore } from '../../manage.store';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { FormGameSettings } from '../../../../../../components/forms/game/settings/settings';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		FormGameSettings,
	},
})
export default class RouteDashGamesManageGameSettings extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	@RouteResolve()
	routeResolve(this: undefined) {}

	routed() {
		Meta.title = this.$gettextInterpolate('Settings for %{ game }', {
			game: this.game.title,
		});
	}

	onSaved() {
		Growls.success(
			this.$gettext('dash.games.settings.save_growl'),
			this.$gettext('dash.games.settings.save_growl_title')
		);
		Scroll.to(0);
	}
}
