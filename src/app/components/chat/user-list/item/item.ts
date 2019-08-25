import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { number } from '../../../../../_common/filters/number';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import { ChatClient, ChatSiteModPermission } from '../../client';
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
	@Prop(ChatUser) user!: ChatUser;
	@Prop(ChatRoom) room?: ChatRoom;
	@Prop(Boolean) showPm?: boolean;
	@Prop(Boolean) showModTools?: boolean;

	@State chat!: ChatClient;

	isInview = false;

	readonly ChatSiteModPermission = ChatSiteModPermission;
	readonly Screen = Screen;

	get canModerate() {
		if (!this.room || !this.showModTools) {
			return false;
		}

		return this.chat.canModerate(this.room, this.user);
	}

	onUserClick(e: Event) {
		if (!this.showPm) {
			return;
		}

		this.chat.enterRoom(this.user.roomId);
		e.preventDefault();
	}

	openModTools() {
		if (this.room) {
			ChatModerateUserModal.show(this.room, this.user);
		}
	}
}
