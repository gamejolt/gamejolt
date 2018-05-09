import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./header-modal.html';

import { FormGameHeader } from '../../forms/game/header/header';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { ModalConfirm } from '../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';

@View
@Component({
	components: {
		FormGameHeader,
	},
})
export default class AppGameHeaderEditModal extends BaseModal {
	@Prop(Game) game: Game;

	async clearHeader() {
		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove your game header?`),
			undefined,
			'yes'
		);

		if (result) {
			this.game.$clearHeader();
		}
	}

	onSaved(game: Game) {
		this.modal.resolve(game);
	}
}
