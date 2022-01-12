import { Options, Prop, Vue } from 'vue-property-decorator';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import { ChatClient } from '../client';
import { ChatMessage } from '../message';

@Options({
	components: {
		AppUserAvatar,
		AppFadeCollapse,
		AppContentViewer,
	},
})
export default class AppChatNotificationGrowl extends Vue {
	@Prop({ type: Object, required: true }) chat!: ChatClient;
	@Prop({ type: Object, required: true }) message!: ChatMessage;
}
