import { Game } from '../../../../_common/game/game.model';
import { Modal } from '../../../../_common/modal/modal.service';
import { asyncComponentLoader } from '../../../../utils/utils';

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
