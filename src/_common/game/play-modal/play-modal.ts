import { mixins, Options, Prop } from 'vue-property-decorator';
import { addMinbarItem, removeMinbarItem } from '../../minbar/minbar.service';
import { BaseModal } from '../../modal/base';
import { Game } from '../game.model';
import { GameRatingGrowl } from '../rating-growl/rating-growl.service';

@Options({})
export default class AppGamePlayModal extends mixins(BaseModal) {
	@Prop(Object)
	game!: Game;

	@Prop(String)
	url!: string;

	@Prop(Boolean)
	canMinimize?: boolean;

	mounted() {
		document.body.classList.add('game-play-modal-open');
	}

	unmounted() {
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
		const minbarItem = addMinbarItem({
			title: this.game.title,
			thumb: this.game.img_thumbnail,
			isActive: true, // Only one game open at a time, so make it active.
			onClick: () => {
				// We remove the item from the minbar.
				removeMinbarItem(minbarItem);

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