import { Component, Prop } from 'vue-property-decorator';
import AppJolticon from '../../../vue/components/jolticon/jolticon.vue';
import { Minbar } from '../../minbar/minbar.service';
import { BaseModal } from '../../modal/base';
import { Game } from '../game.model';
import { GameRatingGrowl } from '../rating-growl/rating-growl.service';
import './play-modal-global.styl';

@Component({
	components: {
		AppJolticon,
	},
})
export default class AppGamePlayModal extends BaseModal {
	@Prop(Game)
	game!: Game;

	@Prop(String)
	url!: string;

	@Prop(Boolean)
	canMinimize?: boolean;

	mounted() {
		document.body.classList.add('game-play-modal-open');
	}

	destroyed() {
		document.body.classList.remove('game-play-modal-open');
	}

	focus() {
		const gameFrame = this.$refs.frame as HTMLElement | undefined;
		if (gameFrame) {
			gameFrame.focus();
		}
	}

	minimize() {
		// We basically animate it out but keep it in the DOM.
		// This is so we don't lose the game when closing it.
		document.body.classList.remove('game-play-modal-open');
		(this.$el as HTMLElement).style.display = 'none';

		// When this minbar item is clicked, it basically shows this modal again.
		const minbarItem = Minbar.add({
			title: this.game.title,
			thumb: this.game.img_thumbnail,
			isActive: true, // Only one game open at a time, so make it active.
			onClick: () => {
				// We remove the item from the minbar.
				Minbar.remove(minbarItem);

				// Then we show the modal again.
				this.maximize();
			},
		});
	}

	private maximize() {
		// Add everything back in!
		document.body.classList.add('game-play-modal-open');
		(this.$el as HTMLElement).style.display = 'block';
	}

	close() {
		this.modal.dismiss();

		// Show a rating growl when they close the game play modal. This will
		// urge them to rate the game after playing it, but only if they haven't
		// rated it yet.
		GameRatingGrowl.show(this.game);
	}
}
