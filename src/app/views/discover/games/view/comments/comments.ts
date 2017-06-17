import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./comments.html';

import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../lib/gj-lib-client/utils/vue';
import { AppCommentWidget } from '../../../../../../lib/gj-lib-client/components/comment/widget/widget';
import { AppAd } from '../../../../../../lib/gj-lib-client/components/ad/ad';
import { RouteState, RouteStore } from '../view.state';

@View
@Component({
	components: {
		AppCommentWidget,
		AppAd,
	},
})
export default class RouteDiscoverGamesViewComments extends Vue {
	@RouteState game: RouteStore['game'];

	Screen = makeObservableService(Screen);

	created() {
		Meta.title = this.$gettextInterpolate(`Comments for %{ game }`, {
			game: this.game.title,
		});
	}
}
