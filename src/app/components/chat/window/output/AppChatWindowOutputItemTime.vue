<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { formatDate } from '../../../../../_common/filters/date';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';

const props = defineProps({
	message: {
		type: Object as PropType<ChatMessage>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoom>,
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

const { message, room, timestampMarginLeft, showAmPm } = toRefs(props);

const loggedOn = computed(() => {
	if (!room.value.shouldShowTimestamp) {
		return null;
	}

	const result = {
		template: formatDate(
			message.value.logged_on,
			showAmPm.value ? 'shortTime' : 'shortTimeNoMeridiem'
		),
		tooltip: formatDate(message.value.logged_on, 'medium'),
	};

	return result;
});
</script>

<template>
	<div class="-item-time">
		<span
			v-if="loggedOn !== null"
			v-app-tooltip="loggedOn.tooltip"
			:style="{ marginLeft: timestampMarginLeft + 'px' }"
		>
			{{ loggedOn.template }}
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.-item-time
	theme-prop('color', 'fg-muted')
	font-size: 11px
	cursor: default

.-byline-error
	cursor: pointer
	vertical-align: middle

.-byline-notice
	vertical-align: middle
</style>
