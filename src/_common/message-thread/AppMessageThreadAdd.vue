<script lang="ts" setup>
import AppUserAvatarBubble from '../../app/components/user/AppUserAvatarBubble.vue';
import { useCommonStore } from '../store/common-store';
import AppTimelineListItem from '../timeline-list/item/item.vue';

defineProps({
	hideMessageSplit: {
		type: Boolean,
	},
});

const { user } = useCommonStore();
</script>

<template>
	<div class="message-thread-add">
		<AppTimelineListItem>
			<template #bubble>
				<AppUserAvatarBubble :user="user" disable-link show-frame show-verified />
			</template>

			<div class="timeline-list-item-details">
				<slot />
			</div>
		</AppTimelineListItem>
		<hr v-if="!hideMessageSplit" class="message-thread-split" />
	</div>
</template>
