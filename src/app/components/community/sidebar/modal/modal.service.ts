import { asyncComponentLoader } from '../../../../../utils/utils';
import { Community } from '../../../../../_common/community/community.model';
import { Modal } from '../../../../../_common/modal/modal.service';
import { CommunitySidebarData } from '../sidebar-data';

interface CommunitySidebarModalOptions {
	isEditing: boolean;
	data: CommunitySidebarData;
	community: Community;
}

export class CommunitySidebarModal {
	static async show(options: CommunitySidebarModalOptions) {
		const { isEditing, community, data } = options;

		return await Modal.show<void>({
			modalId: 'CommunitySidebarModal-' + community.id,
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunitySidebarModal" */ './modal.vue')
				),
			props: {
				isEditing,
				data,
				community,
			},
			size: 'sm',
		});
	}
}
