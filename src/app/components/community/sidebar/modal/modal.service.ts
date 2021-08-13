import { defineAsyncComponent } from 'vue';
import { Community } from '../../../../../_common/community/community.model';
import { Modal } from '../../../../../_common/modal/modal.service';
import { CommunitySidebarData } from '../sidebar-data';

interface Options {
	isEditing: boolean;
	sidebarData: CommunitySidebarData;
	community: Community;
}

export class CommunitySidebarModal {
	static async show(options: Options) {
		const { isEditing, community, sidebarData } = options;

		return await Modal.show<void>({
			modalId: 'CommunitySidebarModal-' + community.id,
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "CommunitySidebarModal" */ './modal.vue')
			),
			props: {
				isEditing,
				sidebarData,
				community,
			},
			size: 'sm',
		});
	}
}
