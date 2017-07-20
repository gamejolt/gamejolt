import { Component } from 'vue-property-decorator';
import * as View from '!view!./comments.html';

import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../lib/gj-lib-client/utils/vue';
import { AppCommentWidget } from '../../../../../../lib/gj-lib-client/components/comment/widget/widget';
import { AppAd } from '../../../../../../lib/gj-lib-client/components/ad/ad';
import { RouteState, RouteStore } from '../view.state';
import { AppAdPlacement } from '../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import { BaseRouteComponent } from '../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		AppCommentWidget,
		AppAd,
		AppAdPlacement,
	},
})
export default class RouteDiscoverGamesViewComments extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	Screen = makeObservableService(Screen);

	routeInit() {
		Meta.title = this.$gettextInterpolate(`Comments for %{ game }`, {
			game: this.game.title,
		});
	}
}
