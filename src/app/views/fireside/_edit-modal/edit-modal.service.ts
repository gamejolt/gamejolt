import { defineAsyncComponent } from 'vue';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { Modal } from '../../../../_common/modal/modal.service';

export class FiresideEditModal {
	static async show(fireside: Fireside) {
		return await Modal.show<void>({
			modalId: 'firesideEdit',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "FiresideEditModal" */ './edit-modal.vue')
			),
			props: {
				fireside,
			},
			size: 'sm',
		});
	}
}
