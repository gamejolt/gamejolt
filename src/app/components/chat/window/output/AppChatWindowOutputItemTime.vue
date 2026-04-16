<script lang="ts" setup>
import { computed } from 'vue';

import { ChatMessageModel } from '~app/components/chat/message';
import { ChatRoomModel } from '~app/components/chat/room';
import { formatDate } from '~common/filters/date';
import { kThemeFgMuted } from '~common/theme/variables';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { kFontSizeTiny } from '~styles/variables';

type Props = {
	message: ChatMessageModel;
	room: ChatRoomModel;
	timestampMarginLeft?: number;
	showAmPm?: boolean;
};
const { message, timestampMarginLeft = 0, showAmPm } = defineProps<Props>();

const loggedOn = computed(() => {
	return {
		template: formatDate(
			message.logged_on,
			showAmPm ? 'shortTime' : 'shortTimeNoMeridiem'
		),
		tooltip: formatDate(message.logged_on, 'medium'),
	};
});
</script>

<template>
	<div
		:style="{
			color: kThemeFgMuted,
			fontSize: kFontSizeTiny.px,
			cursor: 'default',
		}"
	>
		<span
			v-if="loggedOn !== null"
			v-app-tooltip="loggedOn.tooltip"
			:style="{ marginLeft: `${timestampMarginLeft}px` }"
		>
			{{ loggedOn.template }}
		</span>
	</div>
</template>
