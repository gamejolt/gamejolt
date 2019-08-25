import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { BaseModal } from '../../../../../_common/modal/base';
import { Sellable } from '../../../../../_common/sellable/sellable.model';
import { Component, Prop } from 'vue-property-decorator';
import FormGamePackage from '../../../forms/game/package/package.vue';

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
