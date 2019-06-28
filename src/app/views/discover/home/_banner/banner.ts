import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Jam } from 'game-jolt-frontend-lib/components/jam/jam.model';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Location } from 'vue-router';
import { State } from 'vuex-class';
import { FeaturedItem } from '../../../../components/featured-item/featured-item.model';
import AppGameFollowWidget from '../../../../components/game/follow-widget/follow-widget.vue';
import { Store } from '../../../../store/index';

@Component({
	components: {
		AppGameFollowWidget,
		AppTheme,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class AppDiscoverHomeBanner extends Vue {
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

	get shouldShowJamViewGames() {
		if (!this.item.jam) {
			return false;
		}

		return this.item.jam.getPeriod() >= Jam.PERIOD_RUNNING;
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
