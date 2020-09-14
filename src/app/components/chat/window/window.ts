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
import { ChatMessage } from '../message';
import { ChatRoom } from '../room';
import { ChatUserCollection } from '../user-collection';
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
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@Prop(propRequired(Array)) messages!: ChatMessage[];
	@Prop(propOptional(ChatUserCollection)) users?: ChatUserCollection;
	@Prop(propRequired(Array)) queuedMessages!: ChatMessage[];

	@InjectReactive(ChatKey) chat!: ChatClient;

	@Action toggleLeftPane!: Store['toggleLeftPane'];

	isShowingUsers = false;
	isDescriptionCollapsed = false;

	readonly ChatRoom = ChatRoom;
	readonly Screen = Screen;

	get onlineUserCount() {
		return number(this.users?.onlineCount || 0);
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
