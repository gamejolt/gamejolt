import { defineAsyncComponent } from 'vue';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { showModal } from '../../../../../_common/modal/modal.service';
import { RouteStatus } from '../../fireside';

export class FiresideStatsModal {
	static async show(fireside: Fireside, status: RouteStatus, isStreaming: boolean) {
		return await showModal<void>({
			modalId: 'firesideStats',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "FiresideStatsModal" */ './modal.vue')
			),
			props: {
				fireside,
				status,
				isStreaming,
			},
			size: 'sm',
		});
	}
}
