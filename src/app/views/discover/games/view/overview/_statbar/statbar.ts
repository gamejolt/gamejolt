import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { fuzzynumber } from '../../../../../../../_common/filters/fuzzynumber';
import { number } from '../../../../../../../_common/filters/number';
import { AppLazyPlaceholder } from '../../../../../../../_common/lazy/placeholder/placeholder';
import { LikersModal } from '../../../../../../../_common/likers/modal.service';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import AppRatingWidget from '../../../../../../components/rating/widget/widget.vue';
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
