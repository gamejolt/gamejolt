import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { BaseModal } from '../../../../_common/modal/base';
import {
	canModerateChatUser,
	ChatClient,
	ChatKey,
	demodChatUser,
	modChatUser,
	muteChatUser,
	unmuteChatUser,
} from '../client';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';

@Component({})
export default class AppChatModerateUserModal extends BaseModal {
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@Prop(propRequired(ChatUser)) user!: ChatUser;

	@InjectReactive(ChatKey) chat!: ChatClient;

	get canModerate() {
		return this.canPerformAction();
	}

	get canMute() {
		return this.canPerformAction('mute');
	}

	get canMakeMod() {
		return this.canPerformAction('mod');
	}

	private canPerformAction(action?: string) {
		return canModerateChatUser(this.chat, this.room, this.user, action);
	}

	mod() {
		if (!this.canModerate) {
			return;
		}
		modChatUser(this.chat, this.user.id, this.room.id);
	}

	demod() {
		if (!this.canModerate) {
			return;
		}
		demodChatUser(this.chat, this.user.id, this.room.id);
	}

	mute() {
		if (!this.canModerate) {
			return;
		}
		muteChatUser(this.chat, this.user.id, this.room.id);
	}

	unmute() {
		if (!this.canModerate) {
			return;
		}
		unmuteChatUser(this.chat, this.user.id, this.room.id);
	}
}
