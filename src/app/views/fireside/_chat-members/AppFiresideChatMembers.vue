<script lang="ts" setup>
import { PropType } from 'vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppChatMemberList from '../../../components/chat/member-list/AppChatMemberList.vue';
import { ChatRoom } from '../../../components/chat/room';
import { ChatUserCollection } from '../../../components/chat/user-collection';

defineProps({
	chatUsers: {
		type: Object as PropType<ChatUserCollection>,
		required: true,
	},
	chatRoom: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
});
</script>

<template>
	<div class="-chat-members">
		<h3 class="sans-margin-top">
			<AppTranslate>Members</AppTranslate>
			{{ ' ' }}
			<span class="badge">{{ chatUsers.count }}</span>
		</h3>
		<div class="-chat-members-container">
			<AppChatMemberList
				v-if="chatUsers"
				class="-chat-members"
				:users="chatUsers.collection"
				:room="chatRoom"
				hide-filter
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-chat-members
	overflow: hidden

.-chat-members-container
	flex: auto
	min-height: 0
	// Scrollbar breathing room
	padding-right: 4px

.-chat-members
	height: 100%
</style>
