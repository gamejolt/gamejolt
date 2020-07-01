import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import { ChatClient } from '../client';
import { ChatMessage } from '../message';

@Component({
	components: {
		AppUserAvatar,
		AppFadeCollapse,
		AppContentViewer,
	},
})
export default class AppChatNotificationGrowl extends Vue {
	@Prop(propRequired(ChatClient)) chat!: ChatClient;
	@Prop(propRequired(ChatMessage)) message!: ChatMessage;
}
