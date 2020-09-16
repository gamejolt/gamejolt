import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { propOptional, propRequired } from '../../../../utils/vue';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import { number } from '../../../../_common/filters/number';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../store/index';
import { ChatClient, ChatKey, leaveChatRoom } from '../client';
import { ChatInviteModal } from '../invite-modal/invite-modal.service';
import { ChatMessage } from '../message';
import { ChatRoom } from '../room';
import { ChatUserCollection } from '../user-collection';
import AppChatUserList from '../user-list/user-list.vue';
import AppChatWindowOutput from './output/output.vue';
import AppChatWindowSend from './send/send.vue';

@Component({
	components: {
		AppScrollScroller,
		AppChatUserList,
		AppChatWindowSend,
		AppChatWindowOutput,
		AppFadeCollapse,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatWindow extends Vue {
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@Prop(propRequired(Array)) messages!: ChatMessage[];
	@Prop(propRequired(Array)) queuedMessages!: ChatMessage[];

	@InjectReactive(ChatKey) chat!: ChatClient;

	@Action toggleLeftPane!: Store['toggleLeftPane'];

	isShowingUsers = false;
	isDescriptionCollapsed = false;

	readonly ChatRoom = ChatRoom;
	readonly Screen = Screen;

	get users() {
		return this.chat.roomMembers[this.room.id];
	}

	get onlineUserCount() {
		return number(this.users?.onlineCount || 0);
	}

	addGroup() {
		// Filter out the friend in pm room because we add them automatically.
		const invitableUsers = this.chat.friendsList.collection.filter(
			friend => friend.id !== this.room.user?.id
		);
		ChatInviteModal.show(this.room, invitableUsers);
	}

	addMembers() {
		// Filter out the room members as we don't want to add them again.
		const members = this.room.members.map(member => member.id);
		const invitableUsers = this.chat.friendsList.collection.filter(
			({ id }) => !members.includes(id)
		);
		ChatInviteModal.show(this.room, invitableUsers);
	}

	close() {
		// xs size needs to show the friends list when closing the room.
		// any other size can close the whole chat instead
		if (Screen.isXs) {
			leaveChatRoom(this.chat);
		} else {
			this.toggleLeftPane();
		}
	}

	toggleUsers() {
		this.isShowingUsers = !this.isShowingUsers;
	}
}
