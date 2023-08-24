import { defineAsyncComponent } from 'vue';
import { GameModel } from '../../../../_common/game/game.model';
import { showModal } from '../../../../_common/modal/modal.service';

export class ClientInstallPackageModal {
	static async show(game: GameModel) {
		return await showModal({
			modalId: 'ClientInstallPackage-' + game.id,
			component: defineAsyncComponent(() => import('./AppClientInstallPackageModal.vue')),
			props: { game },
			size: 'sm',
		});
	}
}
