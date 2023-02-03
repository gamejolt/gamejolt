<script lang="ts" setup>
import { PropType, ref } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { ChatUser } from '../../../../components/chat/user';
import AppChatManageUserItem from '../../chat/AppChatManageUserItem.vue';

defineProps({
	user: {
		type: Object as PropType<ChatUser>,
		required: true,
	},
	isProcessing: {
		type: Boolean,
		required: true,
	},
	isHost: {
		type: Boolean,
		required: true,
	},
	disableToggle: {
		type: Boolean,
	},
});

const emit = defineEmits({
	click: () => true,
});

const hovered = ref(false);
</script>

<template>
	<AppChatManageUserItem
		:user="user"
		@hover="hovered = true"
		@unhover="hovered = false"
		@click="emit('click')"
	>
		<template #trailing>
			<template v-if="!disableToggle">
				<AppButton
					v-if="!isHost"
					:disabled="isProcessing"
					:force-hover="hovered"
					@click="emit('click')"
				>
					{{ $gettext(`Add`) }}
				</AppButton>
				<AppButton
					v-else
					:disabled="isProcessing"
					circle
					sparse
					trans
					icon="remove"
					:fill-color="hovered ? 'overlay-notice' : undefined"
					@click="emit('click')"
				/>
			</template>
		</template>
	</AppChatManageUserItem>
</template>
