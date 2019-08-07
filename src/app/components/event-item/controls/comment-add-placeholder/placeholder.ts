import { GJ_EMOJIS } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/gj-emoji-nodespec';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppEventItemControlsCommentAddPlaceholder extends Vue {
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

	onMouseEnter() {
		this.setRandomEmoji();
	}

	onClick(type: string) {
		this.$emit('click', type);
	}
}
