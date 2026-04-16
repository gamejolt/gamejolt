<script lang="ts" setup>
import { useCommonStore } from '~common/store/common-store';
import AppTimelineListItem from '~common/timeline-list/item/AppTimelineListItem.vue';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';

type Props = {
	hideMessageSplit?: boolean;
};
defineProps<Props>();

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
