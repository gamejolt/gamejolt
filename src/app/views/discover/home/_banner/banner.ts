import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Location } from 'vue-router';
import { State } from 'vuex-class';
import { AppTrackEvent } from '../../../../../_common/analytics/track-event.directive';
import AppCommunityJoinWidget from '../../../../../_common/community/join-widget/join-widget.vue';
import { Jam } from '../../../../../_common/jam/jam.model';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppTheme } from '../../../../../_common/theme/theme';
import { FeaturedItem } from '../../../../components/featured-item/featured-item.model';
import AppGameFollowWidget from '../../../../components/game/follow-widget/follow-widget.vue';
import { Store } from '../../../../store/index';

@Component({
	components: {
		AppGameFollowWidget,
		AppTheme,
		AppCommunityJoinWidget,
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

	get shouldShowViewGame() {
		if (!this.item.game) {
			return false;
		}

		return !this.item.custom_url || !this.shouldShowFollowGame;
	}

	get shouldShowFollowGame() {
		if (this.item.game) {
			return !this.app.user || !this.item.game.is_following;
		}
		return false;
	}

	get shouldShowViewCommunity() {
		if (!this.item.community) {
			return false;
		}

		return !this.item.custom_url || !this.shouldShowJoinCommunity;
	}

	get shouldShowJoinCommunity() {
		if (this.item.community) {
			return !this.app.user || !this.item.community.is_member;
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
		} else if (this.item.community) {
			return {
				name: 'communities.view.overview',
				params: {
					path: this.item.community.path,
				},
			};
		}
	}

	get theme() {
		if (this.item.game) {
			return this.item.game.theme;
		} else if (this.item.community) {
			return this.item.community.theme;
		}
	}
}
