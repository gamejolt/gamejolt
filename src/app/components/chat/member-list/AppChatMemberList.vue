<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { FiresideController } from '../../fireside/controller/controller';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import { ChatUserCollection } from '../user-collection';
import AppChatList from '../_list/AppChatList.vue';
import AppChatMemberListItem from './AppChatMemberListItem.vue';

const props = defineProps({
	collection: {
		type: Object as PropType<ChatUserCollection>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
	firesideController: {
		type: Object as PropType<FiresideController>,
		default: undefined,
	},
	hideFilter: {
		type: Boolean,
	},
	horizontalPadding: {
		type: Number,
		default: undefined,
	},
});

const { collection, firesideController } = toRefs(props);

/**
 * For firesides we filter out unlistable hosts.
 */
const users = computed(() => {
	if (!firesideController?.value) {
		return collection.value.users;
	}

	const { listableHostIds } = firesideController.value;
	return collection.value.users.filter(i => {
		const firesideHost = collection.value.getFiresideHost(i);

		return (
			!firesideHost || !firesideHost.needsPermissionToView || listableHostIds.value.has(i.id)
		);
	});
});
</script>

<template>
	<AppChatList :entries="users" :hide-filter="hideFilter">
		<template #default="{ item }">
			<AppChatMemberListItem
				:room="room"
				:user="(item as ChatUser)"
				:host="collection.getFiresideHost(item.id)"
				:horizontal-padding="horizontalPadding"
			/>
		</template>
	</AppChatList>
</template>
