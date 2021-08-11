import { defineAsyncComponent } from 'vue';
import { Community } from '../../../../../_common/community/community.model';
import { Modal } from '../../../../../_common/modal/modal.service';
import { CommunitySidebarData } from '../sidebar-data';

interface Options {
	isEditing: boolean;
	data: CommunitySidebarData;
	community: Community;
}

export class CommunitySidebarModal {
	static async show(options: Options) {
		const { isEditing, community, data } = options;

		return await Modal.show<void>({
			modalId: 'CommunitySidebarModal-' + community.id,
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "CommunitySidebarModal" */ './modal.vue')
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
