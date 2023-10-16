<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { formatDate } from '../../../../../_common/filters/date';
import { kThemeFgMuted } from '../../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { kFontSizeTiny } from '../../../../../_styles/variables';
import { ChatMessageModel } from '../../message';
import { ChatRoomModel } from '../../room';

const props = defineProps({
	message: {
		type: Object as PropType<ChatMessageModel>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoomModel>,
		required: true,
	},
	timestampMarginLeft: {
		type: Number,
		default: 0,
	},
	showAmPm: {
		type: Boolean,
	},
});

const { message, timestampMarginLeft, showAmPm } = toRefs(props);

const loggedOn = computed(() => {
	return {
		template: formatDate(
			message.value.logged_on,
			showAmPm.value ? 'shortTime' : 'shortTimeNoMeridiem'
		),
		tooltip: formatDate(message.value.logged_on, 'medium'),
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
