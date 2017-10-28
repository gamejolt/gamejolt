import { Modal } from '../../../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export class ShellHalloweenMonsterModal {
	static async show(avatar: string) {
		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ShellHalloweenMonsterModal" */ './modal')
				),
			props: { avatar },
		});
	}
}
