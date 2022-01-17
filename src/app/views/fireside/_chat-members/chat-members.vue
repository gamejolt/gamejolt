<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppChatMemberList from '../../../components/chat/member-list/member-list.vue';
import { ChatRoom } from '../../../components/chat/room';
import { ChatUserCollection } from '../../../components/chat/user-collection';

@Options({
	components: {
		AppScrollScroller,
		AppChatMemberList,
	},
})
export default class AppFiresideChatMembers extends Vue {
	@Prop({ type: Object, required: true })
	chatUsers!: ChatUserCollection;

	@Prop({ type: Object, required: true })
	chatRoom!: ChatRoom;
}
</script>

<template>
	<div class="-chat-members">
		<h3 class="sans-margin-top">
			<translate>Members</translate>
			<span class="badge">{{ chatUsers.count }}</span>
		</h3>
		<app-scroll-scroller class="-chat-members-scroller">
			<app-chat-member-list
				v-if="chatUsers"
				:users="chatUsers.collection"
				:room="chatRoom"
				hide-filter
			/>
		</app-scroll-scroller>
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
