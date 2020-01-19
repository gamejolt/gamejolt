import { asyncComponentLoader } from '../../../../../utils/utils';
import { Modal } from '../../../../../_common/modal/modal.service';
import { CommunitySidebarData } from '../sidebar-data';

interface CommunitySidebarModalOptions {
	isEditing: boolean;
	data: CommunitySidebarData;
}

export class CommunitySidebarModal {
	static async show(options: CommunitySidebarModalOptions) {
		const { isEditing, data } = options;

		return await Modal.show<void>({
			modalId: 'CommunitySidebarModal-' + data.community.id,
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunitySidebarModal" */ './modal.vue')
				),
			props: {
				isEditing,
				data,
			},
			size: 'sm',
		});
	}
}
