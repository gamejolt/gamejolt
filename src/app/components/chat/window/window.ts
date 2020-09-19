import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { propRequired } from '../../../../utils/vue';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import { number } from '../../../../_common/filters/number';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { Settings } from '../../../../_common/settings/settings.service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../store/index';
import { ChatClient, ChatKey, leaveChatRoom } from '../client';
import { ChatInviteModal } from '../invite-modal/invite-modal.service';
import { ChatMessage } from '../message';
import { ChatRoom } from '../room';
import AppChatUserList from '../user-list/user-list.vue';
import AppChatUserOnlineStatus from '../user-online-status/user-online-status.vue';
import AppChatWindowOutput from './output/output.vue';
import AppChatWindowSend from './send/send.vue';

@Component({
	components: {
		AppScrollScroller,
		AppChatUserList,
		AppChatUserOnlineStatus,
		AppChatWindowSend,
		AppChatWindowOutput,
		AppFadeCollapse,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatWindow extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;

	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@Prop(propRequired(Array)) messages!: ChatMessage[];
	@Prop(propRequired(Array)) queuedMessages!: ChatMessage[];

	@Action toggleLeftPane!: Store['toggleLeftPane'];

	isShowingUsers = Settings.get('chat-group-show-members');
	isDescriptionCollapsed = false;

	readonly Screen = Screen;

	get users() {
		return this.chat.roomMembers[this.room.id];
	}

	get membersCount() {
		return number(this.room.members.length);
	}

	addGroup() {
		// When creating a group from a PM window,
		// we want to put the room user at the top of the list
		const initialUser = this.room.user;
		const invitableUsers = this.chat.friendsList.collection.filter(
			friend => friend.id !== initialUser?.id
		);

		if (initialUser) {
			invitableUsers.unshift(initialUser);
		}

		// Give the InviteModal the initialUser so it can set them as invited by default
		ChatInviteModal.show(this.room, invitableUsers, initialUser);
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
		Settings.set('chat-group-show-members', this.isShowingUsers);
	}
}
