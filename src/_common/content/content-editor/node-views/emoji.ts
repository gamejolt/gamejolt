import AppContentEmoji from '~common/content/components/AppContentEmoji.vue';
import { BaseNodeView } from '~common/content/content-editor/node-views/base';

export class EmojiNodeView extends BaseNodeView {
	mounted() {
		this.mountVue(
			AppContentEmoji,
			{
				emojiId: this.node.attrs.id,
				emojiType: this.node.attrs.type,
			},
			{ inline: true }
		);
	}
}
