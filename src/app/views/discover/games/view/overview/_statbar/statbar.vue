<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { formatFuzzynumber } from '../../../../../../../_common/filters/fuzzynumber';
import { formatNumber } from '../../../../../../../_common/filters/number';
import { AppLazyPlaceholder } from '../../../../../../../_common/lazy/placeholder/placeholder';
import { LikersModal } from '../../../../../../../_common/likers/modal.service';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import AppRatingWidget from '../../../../../../components/rating/widget/widget.vue';
import { useGameRouteController } from '../../view.vue';

@Options({
	components: {
		AppLazyPlaceholder,
		AppRatingWidget,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppDiscoverGamesViewOverviewStatbar extends Vue {
	routeStore = setup(() => useGameRouteController()!);

	readonly formatNumber = formatNumber;
	readonly formatFuzzynumber = formatFuzzynumber;

	get game() {
		return this.routeStore.game;
	}

	get isOverviewLoaded() {
		return this.routeStore.isOverviewLoaded;
	}

	get profileCount() {
		return this.routeStore.profileCount;
	}

	get userRating() {
		return this.routeStore.userRating;
	}

	get likeCount() {
		return this.game?.like_count ?? 0;
	}

	showLikers() {
		LikersModal.show({ count: this.likeCount, resource: this.game });
	}
}
</script>

<template>
	<div
		class="-statbar"
		:class="{
			'-ratings-disabled': !game?.ratings_enabled,
		}"
	>
		<div class="-stat">
			<div class="-label">
				<AppTranslate>views</AppTranslate>
			</div>
			<AppLazyPlaceholder :when="isOverviewLoaded">
				<span class="lazy-placeholder" />
				<span class="-metric" :title="formatNumber(profileCount)">
					<strong>{{ formatFuzzynumber(profileCount) }}</strong>
				</span>
			</AppLazyPlaceholder>
		</div>
		<template v-if="game?.ratings_enabled">
			<a
				v-app-tooltip="$gettext(`View all people that liked this game`)"
				class="-stat"
				@click="showLikers()"
			>
				<div class="-label">
					<AppTranslate>likes</AppTranslate>
				</div>
				<AppLazyPlaceholder :when="isOverviewLoaded">
					<span class="lazy-placeholder" />
					<span class="-metric" :title="formatNumber(likeCount)">
						<strong>{{ formatFuzzynumber(likeCount) }}</strong>
					</span>
				</AppLazyPlaceholder>
			</a>
			<div class="-split" />
			<div class="-rating">
				<AppRatingWidget :game="game" :user-rating="userRating" hide-count />
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>

.-statbar
	theme-prop('border-bottom-color', 'bg-subtle')
	display: flex
	align-items: flex-end
	margin-bottom: $line-height-computed
	border-bottom-style: solid
	border-bottom-width: $border-width-base

// This will push the stats to the right side of the component on mobile.
.-split
	flex: auto

.-rating
.-stat
	padding-bottom: $line-height-computed * 0.75
	flex: none

.-rating
	theme-prop('border-bottom-color', 'bg-subtle')
	border-bottom-style: solid
	border-bottom-width: 2px

.-stat
	theme-prop('color', 'fg')
	margin-right: $grid-gutter-width
	border-bottom-style: solid
	border-bottom-width: 2px
	border-bottom-color: transparent
	padding-bottom: ($line-height-computed * 0.75) - 5px

	a&:hover
		theme-prop('border-bottom-color', 'highlight')

	// When ratings are disabled, we don't want any margin on the left.
	.-ratings-disabled &:first-child
		margin-right: 0

.-label
	font-size: $font-size-small

.-metric
	font-size: $font-size-large
</style>
