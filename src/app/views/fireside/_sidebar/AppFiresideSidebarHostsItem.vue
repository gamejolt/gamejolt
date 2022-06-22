<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { ChatUser } from '../../../components/chat/user';
import AppChatListItem from '../../../components/chat/_list/AppChatListItem.vue';

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
});

const emit = defineEmits({
	click: () => true,
});
</script>

<template>
	<AppChatListItem :horizontal-padding="16" popper-placement="left" popper-trigger="click">
		<template #leading>
			<div class="-member-avatar">
				<img class="-member-avatar-img" :src="user.img_avatar" />
			</div>
		</template>

		<template #title>
			<span>{{ user.display_name }}</span>
			<span class="tiny text-muted">@{{ user.username }}</span>
		</template>

		<template #trailing>
			<AppButton v-if="!isHost" :disabled="isProcessing" @click="emit('click')">
				<AppTranslate>Add</AppTranslate>
			</AppButton>
			<AppButton
				v-else
				:disabled="isProcessing"
				circle
				sparse
				trans
				icon="remove"
				@click="emit('click')"
			/>
		</template>

		<template #popover> TODO </template>
	</AppChatListItem>
</template>

<style lang="stylus" scoped>
.-member-avatar
.-member-avatar-img
	width: 100%
	height: 100%
</style>
