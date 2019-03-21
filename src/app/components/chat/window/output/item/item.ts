import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { ChatClient } from '../../../client';
import { ChatMessage } from '../../../message';
import { ChatRoom } from '../../../room';
import './item-content.styl';


@Component({
	components: {
		AppFadeCollapse,
		AppJolticon,
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
		return this.message.contentRaw.split('\n').length > 6 || this.message.contentRaw.length >= 500;
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
}
