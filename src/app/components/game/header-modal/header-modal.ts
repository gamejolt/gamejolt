import View from '!view!./header-modal.html';
import { Component, Prop } from 'vue-property-decorator';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { FormGameHeader } from '../../forms/game/header/header';

@View
@Component({
	components: {
		FormGameHeader,
	},
})
export default class AppGameHeaderEditModal extends BaseModal {
	@Prop(Game)
	game!: Game;

	// We don't want to close the modal after they've uploaded a header since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousHeaderId: number | null = null;

	created() {
		if (this.game.header_media_item) {
			this.previousHeaderId = this.game.header_media_item.id;
		}
	}

	onSubmit(game: Game) {
		const newHeaderId = (game.header_media_item && game.header_media_item.id) || null;
		if (this.previousHeaderId === newHeaderId) {
			this.modal.resolve(this.game);
		}
		this.previousHeaderId = newHeaderId;
	}
}
