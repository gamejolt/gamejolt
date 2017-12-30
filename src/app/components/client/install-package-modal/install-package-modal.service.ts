import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export class ClientInstallPackageModal {
	static async show(game: Game) {
		return await Modal.show({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ClientInstallPackageModal" */ './install-package-modal')
				),
			props: { game },
			size: 'sm',
		});
	}
}
