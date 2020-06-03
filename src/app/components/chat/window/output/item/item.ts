import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import AppFadeCollapse from '../../../../../../_common/fade-collapse/fade-collapse.vue';
import { date } from '../../../../../../_common/filters/date';
import {
	ChatClient,
	ChatKey,
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

	get loggedOn() {
		return date(this.message.loggedOn, 'medium');
	}

	resendMessage(message: ChatMessage) {
		resendChatMessage(this.chat, message);
	}
}
