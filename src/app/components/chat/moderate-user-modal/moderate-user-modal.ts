import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { BaseModal } from '../../../../_common/modal/base';
import { ChatClient } from '../client';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';

@Component({})
export default class AppChatModerateUserModal extends BaseModal {
	@Prop(ChatRoom) room!: ChatRoom;
	@Prop(ChatUser) user!: ChatUser;

	@State chat!: ChatClient;

	get canModerate() {
		return this.chat.canModerate(this.room, this.user);
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
