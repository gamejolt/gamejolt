import View from '!view!./banner.html?style=./banner.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Location } from 'vue-router';
import { State } from 'vuex-class';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppTheme } from '../../../../../lib/gj-lib-client/components/theme/theme';
import { FeaturedItem } from '../../../../components/featured-item/featured-item.model';
import { AppGameFollowWidget } from '../../../../components/game/follow-widget/follow-widget';
import { Store } from '../../../../store/index';

@View
@Component({
	components: {
		AppGameFollowWidget,
		AppTheme,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppDiscoverHomeBanner extends Vue {
	@Prop(FeaturedItem)
	item!: FeaturedItem;

	@State
	app!: Store['app'];

	readonly Screen = Screen;

	get shouldShowFollow() {
		if (this.item.game) {
			return this.app.user && !this.item.game.is_following;
		}
		return false;
	}

	get location(): Location | undefined {
		if (this.item.game) {
			return {
				name: 'discover.games.view.overview',
				params: {
					id: this.item.game.id + '',
					slug: this.item.game.slug,
				},
			};
		} else if (this.item.jam) {
			return {
				name: 'library.collection.jam',
				params: {
					id: this.item.jam.url,
				},
			};
		}
	}

	get theme() {
		if (this.item.game) {
			return this.item.game.theme;
		}
	}
}
