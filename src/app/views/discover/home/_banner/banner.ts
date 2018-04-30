import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./banner.html?style=./banner.styl';

import { AppGameFollowWidget } from '../../../../components/game/follow-widget/follow-widget';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { FeaturedItem } from '../../../../components/featured-item/featured-item.model';
import { Store } from '../../../../store/index';

@View
@Component({
	components: {
		AppJolticon,
		AppGameFollowWidget,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppDiscoverHomeBanner extends Vue {
	@Prop(FeaturedItem) item: FeaturedItem;

	@State app: Store['app'];

	readonly Screen = Screen;

	get shouldShowFollow() {
		return this.app.user && !this.item.game.is_following && !Screen.isXs;
	}
}
