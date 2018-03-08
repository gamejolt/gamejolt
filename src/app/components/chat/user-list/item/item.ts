import View from '!view!./item.html?style=./item.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { ChatClient, ChatSiteModPermission } from '../../client';
import { ChatRoom } from '../../room';
import { ChatUser } from '../../user';
import { AppScrollInview } from '../../../../../lib/gj-lib-client/components/scroll/inview/inview';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { ChatModerateUserModal } from '../../moderate-user-modal/moderate-user-modal.service';

@View
@Component({
	components: {
		AppScrollInview,
		AppJolticon,
	},
	filters: {
		number,
	},
})
export class AppChatUserListItem extends Vue {
	@Prop(ChatUser) user: ChatUser;
	@Prop(ChatRoom) room?: ChatRoom;
	@Prop(Boolean) showPm?: boolean;
	@Prop(Boolean) showModTools?: boolean;

	@State chat: ChatClient;

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
