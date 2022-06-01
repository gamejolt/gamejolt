<script lang="ts" setup>
import { PropType } from 'vue';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
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
		<AppScrollScroller class="-chat-members-scroller">
			<AppChatMemberList
				v-if="chatUsers"
				:users="chatUsers.collection"
				:room="chatRoom"
				hide-filter
			/>
		</AppScrollScroller>
	</div>
</template>

<style lang="stylus" scoped>
.-chat-members
	overflow: hidden

.-chat-members-scroller
	flex-grow: 1
	// Scrollbar breathing room
	padding-right: 4px
</style>
