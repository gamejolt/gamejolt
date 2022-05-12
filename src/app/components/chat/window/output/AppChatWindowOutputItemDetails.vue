<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { formatDate } from '../../../../../_common/filters/date';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { useChatStore } from '../../chat-store';
import { retryFailedQueuedMessage } from '../../client';
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

const { message, room, showAmPm } = toRefs(props);

const chatStore = useChatStore();

const loggedOn = computed(() => {
	if (!room.value.shouldShowTimestamp) {
		return null;
	}

	const result = {
		template: formatDate(message.value.logged_on, 'shortTime'),
		tooltip: formatDate(message.value.logged_on, 'medium'),
	};

	if (!showAmPm.value) {
		result.template = result.template.replace(/( )?(am|pm)/i, '');
	}
	return result;
});

function onClickResend() {
	retryFailedQueuedMessage(chatStore!.chat!, message.value);
}
</script>

<template>
	<div class="-message-details">
		<template v-if="!message._showAsQueued">
			<span
				v-if="loggedOn !== null"
				v-app-tooltip="loggedOn.tooltip"
				:style="{ marginLeft: timestampMarginLeft + 'px' }"
			>
				{{ loggedOn.template }}
			</span>
		</template>
		<span
			v-else-if="message._error"
			v-app-tooltip="$gettext(`Failed to send. Press to retry`)"
			class="-byline-error"
			@click="onClickResend"
		>
			<AppJolticon icon="notice" notice />
		</span>
		<span v-else v-app-tooltip="$gettext(`Sending...`)" class="-byline-notice">
			<AppJolticon icon="broadcast" />
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.-message-details
	theme-prop('color', 'fg-muted')
	font-size: 11px
	cursor: default

.-byline-error
	cursor: pointer
	vertical-align: middle

.-byline-notice
	vertical-align: middle
</style>
