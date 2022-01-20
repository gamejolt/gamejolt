import AppEmoji from '../../../emoji/AppEmoji.vue';
import { BaseNodeView } from './base';

export class EmojiNodeView extends BaseNodeView {
	mounted() {
		this.mountVue(AppEmoji, { emoji: this.node.attrs.type }, { inline: true });
	}
}
