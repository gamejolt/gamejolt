import { asyncComponentLoader } from '../../../../utils/utils';
import { Community } from '../../../../_common/community/community.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { Modal } from '../../../../_common/modal/modal.service';

interface FiresideAddModalOptions {
	community?: Community;
}

export class FiresideAddModal {
	static async show(options: FiresideAddModalOptions) {
		const { community } = options;

		return await Modal.show<Fireside>({
			modalId: 'FiresideAdd',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "FiresideAddModal" */ './add-modal.vue')
				),
			props: {
				community,
			},
			size: 'sm',
		});
	}
}
