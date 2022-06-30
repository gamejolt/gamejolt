<script lang="ts" setup>
import AppButton from '../../../../_common/button/AppButton.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppChatMemberList from '../../../components/chat/member-list/AppChatMemberList.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeading from './AppFiresideSidebarHeading.vue';

const emit = defineEmits({
	members: () => true,
	hosts: () => true,
});

const c = useFiresideController()!;
const { chatRoom, chatUsers, canManageCohosts } = c;
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppFiresideSidebarHeading showing-members @members="emit('members')" />

			<div v-if="canManageCohosts" class="-manage-button">
				<AppButton block @click="emit('hosts')">
					<AppTranslate>Manage hosts</AppTranslate>
				</AppButton>
			</div>
		</template>

		<template #body>
			<!-- TODO(big-pp-event) might want to filter out chat-users to exclude unlisted hosts here -->
			<AppChatMemberList
				v-if="chatUsers && chatRoom"
				:users="chatUsers.collection"
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
