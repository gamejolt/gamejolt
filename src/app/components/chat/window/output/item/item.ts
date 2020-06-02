import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import AppFadeCollapse from '../../../../../../_common/fade-collapse/fade-collapse.vue';
import { date } from '../../../../../../_common/filters/date';
import {
	canModerateChatUser,
	ChatClient,
	ChatKey,
	muteChatUser,
	removeChatMessage,
	resendChatMessage,
} from '../../../client';
import { ChatMessage } from '../../../message';
import { ChatRoom } from '../../../room';
import './item-content.styl';

@Component({
	components: {
		AppFadeCollapse,
	},
	filters: {
		date,
	},
})
export default class AppChatWindowOutputItem extends Vue {
	@Prop(ChatMessage) message!: ChatMessage;
	@Prop(ChatRoom) room!: ChatRoom;

	@InjectReactive(ChatKey) chat!: ChatClient;

	isExpanded = false;
	isCollapsable = false;

	readonly date = date;
	readonly ChatMessage = ChatMessage;

	get shouldFadeCollapse() {
		return this.message.content.split('\n').length > 6 || this.message.content.length >= 500;
	}

	get canModerate() {
		return canModerateChatUser(this.chat, this.room, this.message.user);
	}

	get loggedOn() {
		return date(this.message.loggedOn, 'medium');
	}

	muteUser() {
		muteChatUser(this.chat, this.message.user.id, this.room.id);
	}

	removeMessage(msgId: number) {
		removeChatMessage(this.chat, msgId, this.room.id);
	}

	resendMessage(message: ChatMessage) {
		resendChatMessage(this.chat, message);
	}
}
