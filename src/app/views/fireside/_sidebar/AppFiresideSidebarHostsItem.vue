<script lang="ts" setup>
import { ref } from '@vue/reactivity';
import { PropType } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { ChatUser } from '../../../components/chat/user';
import AppChatListItem from '../../../components/chat/_list/AppChatListItem.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';

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

const c = useFiresideController()!;
const { canManageCohosts } = c;

const hovered = ref(false);
</script>

<template>
	<AppChatListItem
		:horizontal-padding="16"
		popper-trigger="manual"
		@mouseenter="hovered = true"
		@mouseleave="hovered = false"
		@click="emit('click')"
	>
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
			<template v-if="canManageCohosts">
				<AppButton
					v-if="!isHost"
					:class="{ '-button-hover': hovered }"
					:disabled="isProcessing"
					:force-hover="hovered"
					@click="emit('click')"
				>
					<AppTranslate>Add</AppTranslate>
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
	</AppChatListItem>
</template>

<style lang="stylus" scoped>
.-member-avatar
.-member-avatar-img
	width: 100%
	height: 100%
</style>
