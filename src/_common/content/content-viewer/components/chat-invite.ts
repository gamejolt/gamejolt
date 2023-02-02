import { defineAsyncComponent, h } from 'vue';
import { Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';

export class AppContentViewerChatInvite extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		if (GJ_SECTION === 'app') {
			// Only render this component in the app section.
			// It interacts with grid/chat and the cbar, which are app-exclusive.
			const c = defineAsyncComponent(
				() =>
					import('../../../../app/components/content/components/AppContentChatInvite.vue')
			);
			return h(c, {
				key: this.contentData.attrs.id,
				inviteId: this.contentData.attrs.id,
				isEditing: false,
			});
		} else {
			// Render empty in different sections.
			return h('span');
		}
	}
}
