<script lang="ts" setup>
import { computed } from 'vue';
import AppChatMemberList from '../../../components/chat/member-list/AppChatMemberList.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeading from './AppFiresideSidebarHeading.vue';

const c = useFiresideController()!;
const { chatRoom, chatUsers, listableHostIds } = c;

const users = computed(() =>
	chatUsers.value?.collection.filter(i => {
		if (!i.firesideHost || !i.firesideHost.needsPermissionToView) {
			return true;
		}
		return listableHostIds.value.has(i.id);
	})
);
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppFiresideSidebarHeading />
		</template>

		<template #body>
			<AppChatMemberList
				v-if="users && chatRoom"
				:users="users"
				:room="chatRoom"
				hide-filter
			/>
		</template>
	</AppFiresideSidebar>
</template>

<style lang="stylus" scoped>
.-manage-button
	padding: 16px
</style>
