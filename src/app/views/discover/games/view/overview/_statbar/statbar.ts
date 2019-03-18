import { AppLazyPlaceholder } from 'game-jolt-frontend-lib/components/lazy/placeholder/placeholder';
import { LikersModal } from 'game-jolt-frontend-lib/components/likers/modal.service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { fuzzynumber } from 'game-jolt-frontend-lib/vue/filters/fuzzynumber';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppRatingWidget } from '../../../../../../components/rating/widget/widget';
import { RouteStore, RouteStoreModule } from '../../view.store';

@Component({
	components: {
		AppLazyPlaceholder,
		AppRatingWidget,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppDiscoverGamesViewOverviewStatbar extends Vue {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	isOverviewLoaded!: RouteStore['isOverviewLoaded'];

	@RouteStoreModule.State
	profileCount!: RouteStore['profileCount'];

	@RouteStoreModule.State
	userRating!: RouteStore['userRating'];

	readonly number = number;
	readonly fuzzynumber = fuzzynumber;

	get likeCount() {
		return this.game.like_count;
	}

	showLikers() {
		LikersModal.show({ count: this.likeCount, resource: this.game });
	}
}
