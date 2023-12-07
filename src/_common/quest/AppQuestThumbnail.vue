<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { styleElevate, styleFlexCenter, styleOverlayTextShadow } from '../../_styles/mixins';
import { kFontSizeBase, kFontSizeTiny } from '../../_styles/variables';
import AppImgResponsive from '../img/AppImgResponsive.vue';
import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';
import { kThemeGjOverlayNotice, kThemePrimary, kThemePrimaryFg } from '../theme/variables';
import AppQuestFrame from './AppQuestFrame.vue';
import { QuestModel } from './quest-model';

interface QuestBlipState {
	bgColor: string;
	color: string;
	icon: Jolticon | null;
}

const props = defineProps({
	quest: {
		type: Object as PropType<QuestModel>,
		required: true,
	},
});

const { quest } = toRefs(props);

const questBlipState = computed<QuestBlipState | undefined>(() => {
	const q = quest.value;
	if (q.has_activity) {
		return {
			bgColor: kThemeGjOverlayNotice,
			color: 'white',
			icon: 'gift',
		};
	} else if (q.isAllComplete) {
		return {
			bgColor: kThemePrimary,
			color: kThemePrimaryFg,
			icon: 'double-check',
		};
	} else if (q.isComplete) {
		return {
			bgColor: kThemePrimary,
			color: kThemePrimaryFg,
			icon: 'check',
		};
	} else if (q.is_new && !q.isExpired) {
		return {
			bgColor: kThemeGjOverlayNotice,
			color: 'white',
			icon: null,
		};
	}
});
</script>

<template>
	<div
		:style="{
			position: `relative`,
		}"
	>
		<AppQuestFrame>
			<AppImgResponsive
				:style="{
					width: `100%`,
					height: `100%`,
					objectFit: `cover`,
				}"
				:src="quest.avatar.mediaserver_url"
				alt="Quest Image"
			/>
		</AppQuestFrame>

		<div
			v-if="questBlipState"
			:style="{
				...styleElevate(1),
				...styleFlexCenter(),
				backgroundColor: questBlipState.bgColor,
				borderRadius: `50%`,
				minWidth: kFontSizeBase.px,
				minHeight: kFontSizeBase.px,
				padding: `4px`,
				position: `absolute`,
				top: 0,
				right: 0,
				zIndex: 1,
			}"
		>
			<AppJolticon
				v-if="questBlipState.icon"
				:style="{
					...styleOverlayTextShadow,
					margin: 0,
					fontSize: kFontSizeTiny.px,
					color: questBlipState.color,
				}"
				:icon="questBlipState.icon"
			/>
		</div>
	</div>
</template>
