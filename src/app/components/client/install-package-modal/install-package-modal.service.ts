import { defineAsyncComponent } from 'vue';

import { GameModel } from '~common/game/game.model';
import { showModal } from '~common/modal/modal.service';

export async function showClientInstallPackageModal(game: GameModel) {
	return await showModal({
		modalId: 'ClientInstallPackage-' + game.id,
		component: defineAsyncComponent(
			() =>
				import('~app/components/client/install-package-modal/AppClientInstallPackageModal.vue')
		),
		props: { game },
		size: 'sm',
	});
}
