import View from '!view!./statbar.html?style=./statbar.styl';
import { AppLazyPlaceholder } from 'game-jolt-frontend-lib/components/lazy/placeholder/placeholder';
import { LikersModal } from 'game-jolt-frontend-lib/components/likers/modal.service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { fuzzynumber } from 'game-jolt-frontend-lib/vue/filters/fuzzynumber';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppRatingWidget } from '../../../../../../components/rating/widget/widget';
import { RouteState, RouteStore } from '../../view.store';

@View
@Component({
	components: {
		AppLazyPlaceholder,
		AppRatingWidget,
	},
	directives: {
		AppTooltip,
	},
})
export class AppDiscoverGamesViewOverviewStatbar extends Vue {
	@RouteState
	game!: RouteStore['game'];

	@RouteState
	isOverviewLoaded!: RouteStore['isOverviewLoaded'];

	@RouteState
	profileCount!: RouteStore['profileCount'];

	@RouteState
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
