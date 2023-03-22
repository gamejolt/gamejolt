import AppContentEmoji from '../../components/AppContentEmoji.vue';
import { BaseNodeView } from './base';

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
