import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./edit-modal.html';

import { BaseModal } from '../../../../../lib/gj-lib-client/components/modal/base';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Sellable } from '../../../../../lib/gj-lib-client/components/sellable/sellable.model';
import { FormGamePackage } from '../../../forms/game/package/package';

@View
@Component({
	components: {
		FormGamePackage,
	},
})
export default class AppGamePackageEditModal extends BaseModal {
	@Prop(Game) game?: Game;
	@Prop(GamePackage) gamePackage?: GamePackage;
	@Prop(Sellable) sellable?: Sellable;

	onSubmitted(gamePackage: GamePackage) {
		this.modal.resolve(gamePackage);
	}
}
