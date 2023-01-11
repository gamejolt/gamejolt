import { h } from 'vue';
import { Prop, Vue } from 'vue-property-decorator';
import AppContentChatInvite from '../../components/AppContentChatInvite.vue';
import { ContentObject } from '../../content-object';

export class AppContentViewerChatInvite extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		return h(AppContentChatInvite, {
			key: this.contentData.attrs.id,
			inviteId: this.contentData.attrs.id,
			isEditing: false,
		});
	}
}
