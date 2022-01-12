import { mixins, Options, Prop } from 'vue-property-decorator';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { BaseModal } from '../../../../../_common/modal/base';
import { Sellable } from '../../../../../_common/sellable/sellable.model';
import FormGamePackage from '../../../forms/game/package/package.vue';

@Options({
	components: {
		FormGamePackage,
	},
})
export default class AppGamePackageEditModal extends mixins(BaseModal) {
	@Prop(Object) game?: Game;
	@Prop(Object) gamePackage?: GamePackage;
	@Prop(Object) sellable?: Sellable;

	onSubmitted(gamePackage: GamePackage) {
		this.modal.resolve(gamePackage);
	}
}
