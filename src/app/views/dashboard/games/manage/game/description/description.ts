import { Component } from 'vue-property-decorator';
import * as View from '!view!./description.html';

import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { RouteState, RouteStore } from '../../manage.store';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { FormGameDescription } from '../../../../../../components/forms/game/description/description';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageGameDescription',
	components: {
		FormGameDescription,
	},
})
export default class RouteDashGamesManageGameDescription extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	routeInit() {
		Meta.title = this.$gettextInterpolate('Edit Description for %{ game }', {
			game: this.game.title,
		});
	}

	onSaved() {
		Growls.success(
			this.$gettext(`Your game description has been saved.`),
			this.$gettext(`Description Saved`)
		);
		Scroll.to(0);
	}
}
