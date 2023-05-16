<script lang="ts" setup>
import AppChatMemberList from '../../../components/chat/member-list/AppChatMemberList.vue';
import { useChatRoomMembers } from '../../../components/chat/room-channel';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeading from './AppFiresideSidebarHeading.vue';

const { chatRoom } = useFiresideController()!;
const { memberCollection } = useChatRoomMembers(chatRoom);
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppFiresideSidebarHeading />
		</template>

		<template #body>
			<AppChatMemberList
				v-if="chatRoom && memberCollection"
				:collection="memberCollection"
				:room="chatRoom"
				hide-filter
			/>
		</template>
	</AppFiresideSidebar>
</template>
