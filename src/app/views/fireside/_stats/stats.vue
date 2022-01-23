<script lang="ts">
import { setup, Vue } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import AppCard from '../../../../_common/card/AppCard.vue';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppShareCard from '../../../../_common/share/card/card.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import {
	extendFireside,
	publishFireside,
	useFiresideController,
} from '../../../components/fireside/controller/controller';
import { illEndOfFeed } from '../../../img/ill/illustrations';
import AppFiresideShare from '../_share/share.vue';

@Options({
	components: {
		AppIllustration,
		AppProgressBar,
		AppCard,
		AppScrollScroller,
		AppShareCard,
		AppFiresideShare,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideStats extends Vue {
	commonStore = setup(() => useCommonStore());

	c = shallowSetup(() => useFiresideController()!);

	readonly illEndOfFeed = illEndOfFeed;

	get user() {
		return this.commonStore.user;
	}

	get fireside() {
		return this.c.fireside;
	}

	onClickPublish() {
		publishFireside(this.c);
	}

	onClickExtend() {
		extendFireside(this.c);
	}
}
</script>

<template>
	<div class="fireside-stats">
		<app-scroll-scroller thin>
			<app-illustration :src="illEndOfFeed" />

			<template v-if="!c.isDraft.value">
				<template v-if="!c.isStreaming.value">
					<div v-if="c.expiresProgressValue.value !== null" class="-burnout-bar">
						<app-progress-bar :percent="c.expiresProgressValue.value" thin />
					</div>
					<div v-else class="-burnout-bar-placeholder" />
				</template>

				<div v-if="c.totalDurationText.value" class="text-center">
					<span><translate>Fireside active for:</translate></span>
					<span>
						<b>{{ c.totalDurationText.value }}</b>
					</span>
				</div>

				<div
					v-if="!c.isStreaming.value && c.expiresDurationText.value"
					class="text-center -burnout-timer"
				>
					<span><translate>Fire burns out in:</translate></span>
					<span>
						<b>{{ c.expiresDurationText.value }}</b>
					</span>
				</div>
			</template>

			<template v-if="c.canPublish.value">
				<app-button
					v-app-tooltip.bottom="$gettext(`Make your fireside public`)"
					block
					primary
					solid
					class="-publish-btn"
					@click="onClickPublish()"
				>
					<translate>Publish</translate>
				</app-button>
				<p class="help-block">
					<translate>
						Your fireside is currently in draft. Only you can view it. Publish it to let
						everyone join!
					</translate>
				</p>
			</template>

			<template v-if="!c.isDraft.value && !c.isStreaming.value && c.canExtend.value">
				<app-button
					v-app-tooltip.bottom="$gettext(`Extend the duration of your fireside`)"
					block
					icon="fireside"
					class="-extend-btn"
					@click="onClickExtend()"
				>
					<translate>Stoke the Flames</translate>
				</app-button>
				<p class="help-block">
					<translate>
						Firesides stay open for as long as you're around. Stoke the flames to keep
						your fireside going.
					</translate>
				</p>
			</template>
		</app-scroll-scroller>

		<div v-if="!c.isDraft.value">
			<app-fireside-share />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.fireside-stats
	display: flex
	flex-direction: column
	justify-content: space-between
	height: 100%

.-burnout-timer
	color: var(--theme-highlight)

.-burnout-bar
	padding-left: 28px
	padding-right: 28px

.-burnout-bar-placeholder
	height: 26px
	width: 1px

.-publish-btn
	margin-top: 16px

.-extend-btn
	margin-top: 16px
	animation-name: fade-in
	animation-duration: 2.5s
	animation-iteration-count: 1
	animation-fill-mode: forwards
</style>
