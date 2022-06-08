<script lang="ts" setup>
import AppButton from '../../../_common/button/AppButton.vue';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppProgressBar from '../../../_common/progress/AppProgressBar.vue';
import AppScrollScroller from '../../../_common/scroll/AppScrollScroller.vue';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import {
	extendFireside,
	publishFireside,
	useFiresideController,
} from '../../components/fireside/controller/controller';
import { illEndOfFeed } from '../../img/ill/illustrations';
import AppFiresideShare from './_share/share.vue';

const c = useFiresideController()!;
const {
	isDraft,
	isStreaming,
	expiresProgressValue,
	totalDurationText,
	expiresDurationText,
	canPublish,
	canExtend,
} = c;

function onClickPublish() {
	publishFireside(c);
}

function onClickExtend() {
	extendFireside(c);
}
</script>

<template>
	<div class="fireside-stats">
		<AppScrollScroller thin>
			<AppIllustration :src="illEndOfFeed" />

			<template v-if="!isDraft">
				<template v-if="!isStreaming">
					<div v-if="expiresProgressValue !== undefined" class="-burnout-bar">
						<AppProgressBar :percent="expiresProgressValue" thin />
					</div>
					<div v-else class="-burnout-bar-placeholder" />
				</template>

				<div v-if="totalDurationText" class="text-center">
					<span><AppTranslate>Fireside active for:</AppTranslate></span>
					<span>
						<b>{{ totalDurationText }}</b>
					</span>
				</div>

				<div v-if="!isStreaming && expiresDurationText" class="text-center -burnout-timer">
					<span><AppTranslate>Fire burns out in:</AppTranslate></span>
					<span>
						<b>{{ expiresDurationText }}</b>
					</span>
				</div>
			</template>

			<template v-if="canPublish">
				<AppButton
					v-app-tooltip.bottom="$gettext(`Make your fireside public`)"
					block
					primary
					solid
					class="-publish-btn"
					@click="onClickPublish()"
				>
					<AppTranslate>Publish</AppTranslate>
				</AppButton>
				<p class="help-block">
					<AppTranslate>
						Your fireside is currently in draft. Only you can view it. Publish it to let
						everyone join!
					</AppTranslate>
				</p>
			</template>

			<template v-if="!isDraft && !isStreaming && canExtend">
				<AppButton
					v-app-tooltip.bottom="$gettext(`Extend the duration of your fireside`)"
					block
					icon="fireside"
					class="-extend-btn"
					@click="onClickExtend()"
				>
					<AppTranslate>Stoke the Flames</AppTranslate>
				</AppButton>
				<p class="help-block">
					<AppTranslate>
						Firesides stay open for as long as you're around. Stoke the flames to keep
						your fireside going.
					</AppTranslate>
				</p>
			</template>
		</AppScrollScroller>

		<div v-if="!c.isDraft.value">
			<AppFiresideShare />
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
