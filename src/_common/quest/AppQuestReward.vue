<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { formatNumber } from '../filters/number';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppJolticon from '../jolticon/AppJolticon.vue';
import { vAppTooltip } from '../tooltip/tooltip-directive';
import { $gettext } from '../translate/translate.service';
import { QuestRewardTypes } from './quest-objective-reward-model';
import { QuestReward } from './quest-reward-model';

const props = defineProps({
	reward: {
		type: Object as PropType<QuestReward>,
		required: true,
	},
});

const { reward } = toRefs(props);

const fallbackIcon = computed(() => {
	if (reward.value.is_secret) {
		return 'other-os';
	}

	if (reward.value.type === QuestRewardTypes.randomSticker) {
		return 'sticker';
	}

	return 'gift';
});

const subtitle = computed(() => {
	switch (reward.value.type) {
		case QuestRewardTypes.sticker:
			if (reward.value.name !== 'Sticker') {
				return $gettext(`Sticker`);
			}
			break;
		case QuestRewardTypes.background:
			if (reward.value.name !== 'Background') {
				return $gettext(`Background`);
			}
			break;
		case QuestRewardTypes.avatarFrame:
			if (reward.value.name !== 'Avatar Frame') {
				return $gettext(`Avatar Frame`);
			}
			break;
	}

	return null;
});

const nameTooltip = computed(() => {
	const name = reward.value.name;
	let tooltip = name;
	const subtitleText = subtitle.value || '';
	if (subtitleText) {
		tooltip += ` (${subtitleText})`;
	}

	if (name.length + subtitleText.length * 0.75 < 28) {
		return undefined;
	}
	return tooltip;
});
</script>

<template>
	<div>
		<div class="_reward">
			<div class="_reward-img">
				<template v-if="reward.media">
					<img
						v-if="reward.media.is_animated"
						:src="reward.media.img_url"
						:style="{
							width: `100%`,
							height: `100%`,
						}"
						alt=""
					/>
					<AppImgResponsive v-else :src="reward.media.mediaserver_url" />
				</template>
				<template v-else>
					<AppJolticon :icon="fallbackIcon" big />
				</template>
			</div>
			<span v-app-tooltip="nameTooltip" class="_reward-name">
				{{ reward.name }}
				<span v-if="subtitle" class="_reward-name-subtitle">({{ subtitle }})</span>
			</span>
			<span v-if="reward.amount > 1" class="_reward-amount">
				x{{ formatNumber(reward.amount) }}
			</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
._reward
	change-bg('bg-offset')
	width: 140px
	height: 148px
	rounded-corners-lg()
	padding-top: 12px
	padding-bottom: 6px
	padding-left: 8px
	padding-right: 8px
	display: flex
	flex-direction: column
	justify-content: space-between
	align-items: center
	position: relative
	elevate-hover-1()
	transition: transform 0.15s ease

	&:hover
		transform: translateY(-2px)

._reward-img
	width: 80px
	height: 80px
	display: flex
	align-items: center
	justify-content: center
	overflow: hidden
	rounded-corners()

._reward-amount
	position: absolute
	right: 16px
	bottom: 38px
	font-family: 'Germania'
	font-size: 28px
	color: white
	-webkit-text-stroke: 1px $theme-backlight
	text-stroke: 1px $theme-backlight
	transform: rotate(10deg)
	user-select: none

._reward-name
	display: inline-block
	height: 43px
	line-clamp: 2
	text-align: center

._reward-name-subtitle
	font-size: $font-size-tiny * 0.85
	text-transform: uppercase
	color: var(--theme-fg-muted)
	user-select: none
</style>
