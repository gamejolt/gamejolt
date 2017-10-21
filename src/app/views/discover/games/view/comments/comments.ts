import { Component } from 'vue-property-decorator';
import View from '!view!./comments.html';

import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../lib/gj-lib-client/utils/vue';
import { AppAd } from '../../../../../../lib/gj-lib-client/components/ad/ad';
import { RouteState, RouteStore } from '../view.store';
import { AppAdPlacement } from '../../../../../../lib/gj-lib-client/components/ad/placement/placement';
import { BaseRouteComponent } from '../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppCommentWidgetLazy } from '../../../../../components/lazy';

@View
@Component({
	name: 'RouteDiscoverGamesViewComments',
	components: {
		AppCommentWidget: AppCommentWidgetLazy,
		AppAd,
		AppAdPlacement,
	},
})
export default class RouteDiscoverGamesViewComments extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	Screen = makeObservableService(Screen);

	get routeTitle() {
		return this.$gettextInterpolate(`Comments for %{ game }`, {
			game: this.game.title,
		});
	}
}
