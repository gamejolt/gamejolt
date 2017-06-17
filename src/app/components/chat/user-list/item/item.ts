import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./item.html?style=./item.styl';

import { ChatRoom } from '../../room';
import { ChatUser } from '../../user';
import { ChatClient, ChatSiteModPermission } from '../../client';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';

@View
@Component({
	components: {
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

	areModToolsOpen = false;

	ChatSiteModPermission = ChatSiteModPermission;

	get canModerate() {
		if (!this.room || !this.showModTools) {
			return false;
		}

		return this.chat.canModerate(this.room, this.user);
	}

	onUserClick() {
		// Otherwise, the default is just to follow the link, which is fine.
		if (!this.showPm) {
			return;
		}

		this.chat.enterRoom(this.user.roomId, true);
	}

	toggleModTools() {
		this.areModToolsOpen = !this.areModToolsOpen;
	}

	mod() {
		if (!this.canModerate) {
			return;
		}
		this.chat.mod(this.user.id, this.room!.id);
	}

	demod() {
		if (!this.canModerate) {
			return;
		}
		this.chat.demod(this.user.id, this.room!.id);
	}

	mute() {
		if (!this.canModerate) {
			return;
		}
		this.chat.mute(this.user.id, this.room!.id);
	}

	unmute() {
		if (!this.canModerate) {
			return;
		}
		this.chat.unmute(this.user.id, this.room!.id);
	}
}
