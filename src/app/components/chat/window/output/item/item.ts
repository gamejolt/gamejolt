import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { ContentRules } from '../../../../../../_common/content/content-editor/content-rules';
import AppContentViewer from '../../../../../../_common/content/content-viewer/content-viewer.vue';
import { date } from '../../../../../../_common/filters/date';
import AppPopper from '../../../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { ChatClient, ChatKey, retryFailedQueuedMessage, removeMessage } from '../../../client';
import { ChatMessage } from '../../../message';
import { ChatRoom } from '../../../room';

@Component({
	components: {
		AppContentViewer,
		AppPopper,
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
	@Prop(propRequired(Boolean)) isNew!: boolean;

	@InjectReactive(ChatKey) chat!: ChatClient;

	readonly date = date;
	readonly ChatMessage = ChatMessage;
	readonly displayRules = new ContentRules({ maxMediaWidth: 400, maxMediaHeight: 300 });

	get loggedOn() {
		return date(this.message.logged_on, 'medium');
	}

	onClickResend() {
		retryFailedQueuedMessage(this.chat, this.message);
	}

	onRemove() {
		removeMessage(this.chat, this.message.id);
	}
}
