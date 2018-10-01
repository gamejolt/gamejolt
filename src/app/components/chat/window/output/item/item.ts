import './item-content.styl';

import View from '!view!./item.html?style=./item.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { AppFadeCollapse } from '../../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { date } from '../../../../../../lib/gj-lib-client/vue/filters/date';
import { ChatClient } from '../../../client';
import { ChatMessage } from '../../../message';
import { ChatRoom } from '../../../room';

@View
@Component({
	components: {
		AppFadeCollapse,
		AppJolticon,
	},
	filters: {
		date,
	},
})
export class AppChatWindowOutputItem extends Vue {
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
