<script lang="ts" setup>
import { computed } from 'vue';

import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import AppQuestFrame from '~common/quest/AppQuestFrame.vue';
import { QuestModel } from '~common/quest/quest-model';
import { kThemeGjOverlayNotice, kThemePrimary, kThemePrimaryFg } from '~common/theme/variables';
import { styleElevate, styleFlexCenter, styleOverlayTextShadow } from '~styles/mixins';
import { kFontSizeBase, kFontSizeTiny } from '~styles/variables';

interface QuestBlipState {
	bgColor: string;
	color: string;
	icon: Jolticon | null;
}

type Props = {
	quest: QuestModel;
};
const { quest } = defineProps<Props>();

const questBlipState = computed<QuestBlipState | undefined>(() => {
	const q = quest;
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
