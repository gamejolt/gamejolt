import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';
import { FiresideController } from '../../../components/fireside/controller/controller';

export class FiresideEditModal {
	static async show(controller: FiresideController) {
		return await showModal<void>({
			modalId: 'firesideEdit',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "FiresideEditModal" */ './edit-modal.vue')
			),
			props: {
				controller,
			},
			size: 'sm',
		});
	}
}
