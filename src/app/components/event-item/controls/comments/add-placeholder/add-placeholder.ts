import Vue from 'vue';
import Component from 'vue-class-component';
import { GJ_EMOJIS } from '../../../../../../_common/content/content-editor/schemas/specs/nodes/gj-emoji-nodespec';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppEventItemControlsCommentsAddPlaceholder extends Vue {
	emoji = 'huh'; // Gets set to a random one at created

	get emojis() {
		return GJ_EMOJIS;
	}

	created() {
		this.setRandomEmoji();
	}

	private setRandomEmoji() {
		const prev = this.emoji;
		do {
			const emojiIndex = Math.floor(Math.random() * GJ_EMOJIS.length);
			this.emoji = GJ_EMOJIS[emojiIndex];
		} while (prev === this.emoji);
	}

	onMouseEnterEmoji() {
		this.setRandomEmoji();
	}

	onClick(type: string) {
		this.$emit('click', type);
	}
}
