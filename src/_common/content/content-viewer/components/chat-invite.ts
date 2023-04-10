import { Component, h } from 'vue';
import { Prop, Vue } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';

// App bootstrap will assign the component we should render.
let chatInviteComponent: any = 'span';

/**
 * Assigns the component that the `chat-invite` content viewer node should
 * render.
 */
export function setChatInviteComponent(newComponent: Component) {
	chatInviteComponent = newComponent;
}

export class AppContentViewerChatInvite extends Vue {
	@Prop({ type: ContentObject })
	contentData!: ContentObject;

	render() {
		if (GJ_SECTION === 'app') {
			// Only render this component in the app section.
			// It interacts with grid/chat and the cbar, which are app-exclusive.
			return h(chatInviteComponent, {
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
