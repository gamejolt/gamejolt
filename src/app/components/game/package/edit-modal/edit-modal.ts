import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GamePackage } from 'game-jolt-frontend-lib/components/game/package/package.model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { Sellable } from 'game-jolt-frontend-lib/components/sellable/sellable.model';
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
