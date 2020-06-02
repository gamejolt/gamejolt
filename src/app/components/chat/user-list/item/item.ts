import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { number } from '../../../../../_common/filters/number';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import {
	canModerateChatUser,
	ChatClient,
	ChatKey,
	ChatSiteModPermission,
	enterChatRoom,
} from '../../client';
import { ChatModerateUserModal } from '../../moderate-user-modal/moderate-user-modal.service';
import { ChatRoom } from '../../room';
import { ChatUser } from '../../user';

@Component({
	components: {
		AppScrollInview,
	},
	filters: {
		number,
	},
})
export default class AppChatUserListItem extends Vue {
	@Prop(propRequired(ChatUser)) user!: ChatUser;
	@Prop(propOptional(ChatRoom)) room?: ChatRoom;
	@Prop(propOptional(Boolean, false)) showPm!: boolean;
	@Prop(propOptional(Boolean, false)) showModTools!: boolean;

	@InjectReactive(ChatKey) chat!: ChatClient;

	isInview = false;

	readonly ChatSiteModPermission = ChatSiteModPermission;
	readonly Screen = Screen;

	get canModerate() {
		if (!this.room || !this.showModTools) {
			return false;
		}

		return canModerateChatUser(this.chat, this.room, this.user);
	}

	onUserClick(e: Event) {
		if (!this.showPm) {
			return;
		}

		enterChatRoom(this.chat, this.user.roomId);
		e.preventDefault();
	}

	openModTools() {
		if (this.room) {
			ChatModerateUserModal.show(this.room, this.user);
		}
	}
}
