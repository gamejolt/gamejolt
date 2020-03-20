import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppFadeCollapse from '../../../../../../_common/fade-collapse/fade-collapse.vue';
import { date } from '../../../../../../_common/filters/date';
import { ChatClient } from '../../../client';
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

	@State chat!: ChatClient;

	isExpanded = false;
	isCollapsable = false;

	readonly date = date;
	readonly ChatMessage = ChatMessage;

	get shouldFadeCollapse() {
		return this.message.content.split('\n').length > 6 || this.message.content.length >= 500;
	}

	get canModerate() {
		return this.chat.canModerate(this.room, this.message.user);
	}

	get loggedOn() {
		return date(this.message.loggedOn, 'medium');
	}

	muteUser() {
		this.chat.mute(this.message.user.id, this.room.id);
	}

	removeMessage(msgId: number) {
		this.chat.removeMessage(msgId, this.room.id);
	}

	resendMessage(message: ChatMessage) {
		this.chat.resendMessage(message);
	}
}
