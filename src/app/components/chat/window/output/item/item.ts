import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import AppContentViewer from '../../../../../../_common/content/content-viewer/content-viewer.vue';
import { date } from '../../../../../../_common/filters/date';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { ChatClient, ChatKey } from '../../../client';
import { ChatMessage } from '../../../message';
import { ChatRoom } from '../../../room';

@Component({
	components: {
		AppContentViewer,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		date,
	},
})
export default class AppChatWindowOutputItem extends Vue {
	@Prop(ChatMessage) message!: ChatMessage;
	@Prop(ChatRoom) room!: ChatRoom;

	@InjectReactive(ChatKey) chat!: ChatClient;

	readonly date = date;
	readonly ChatMessage = ChatMessage;

	get loggedOn() {
		return date(this.message.logged_on, 'medium');
	}
}
