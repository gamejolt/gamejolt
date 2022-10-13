<script lang="ts" setup>
import { computed } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppChatMemberList from '../../../components/chat/member-list/AppChatMemberList.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeading from './AppFiresideSidebarHeading.vue';

const { chatRoom, chatUsers, canManageCohosts, listableHostIds, sidebar } =
	useFiresideController()!;

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

			<div v-if="canManageCohosts" class="-manage-button">
				<AppButton block @click="sidebar = 'hosts'">
					<AppTranslate>Manage Hosts</AppTranslate>
				</AppButton>
			</div>
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
