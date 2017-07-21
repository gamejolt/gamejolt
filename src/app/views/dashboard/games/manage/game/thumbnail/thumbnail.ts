import { Component } from 'vue-property-decorator';
import * as View from '!view!./thumbnail.html';

import { RouteState, RouteStore } from '../../manage.store';
import { Meta } from '../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Scroll } from '../../../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { FormGameThumbnail } from '../../../../../../components/forms/game/thumbnail/thumbnail';
import { AppDashGameWizardControls } from '../../../../../../components/forms/game/wizard-controls/wizard-controls';
import { BaseRouteComponent } from '../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		FormGameThumbnail,
		AppDashGameWizardControls,
	},
})
export default class RouteDashGamesManageGameThumbnail extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	routeInit() {
		Meta.title = this.$gettextInterpolate(`Edit Thumbnail for %{ game }`, {
			game: this.game.title,
		});
	}

	onSaved() {
		Growls.success(
			this.$gettext('dash.games.thumbnail.saved_growl'),
			this.$gettext('dash.games.thumbnail.saved_growl_title')
		);
		Scroll.to(0);
	}
}
