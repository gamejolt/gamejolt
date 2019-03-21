import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export class ClientInstallPackageModal {
	static async show(game: Game) {
		return await Modal.show({
			modalId: 'ClientInstallPackage-' + game.id,
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ClientInstallPackageModal" */ './install-package-modal.vue')
				),
			props: { game },
			size: 'sm',
		});
	}
}
