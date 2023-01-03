<script lang="ts" setup>
import AppButton from '../../../../_common/button/AppButton.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppChatMemberList from '../../../components/chat/member-list/AppChatMemberList.vue';
import { useChatRoomMembers } from '../../../components/chat/room-channel';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeading from './AppFiresideSidebarHeading.vue';

const c = useFiresideController()!;
const { chatRoom, canManageCohosts, setSidebar } = c;
const { memberCollection } = useChatRoomMembers(chatRoom);
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppFiresideSidebarHeading />

			<div v-if="canManageCohosts" class="-manage-button">
				<AppButton block @click="setSidebar('hosts', 'members')">
					<AppTranslate>Manage Hosts</AppTranslate>
				</AppButton>
			</div>
		</template>

		<template #body>
			<AppChatMemberList
				v-if="chatRoom && memberCollection"
				:collection="memberCollection"
				:room="chatRoom"
				:fireside-controller="c"
				hide-filter
			/>
		</template>
	</AppFiresideSidebar>
</template>

<style lang="stylus" scoped>
.-manage-button
	padding: 16px
</style>
