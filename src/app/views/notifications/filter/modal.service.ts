import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

interface NotificationsFilterModalOptions {
	filters: string[];
	replaceRoute?: boolean;
}

export class NotificationsFilterModal {
	static async show(options: NotificationsFilterModalOptions) {
		const { filters, replaceRoute } = options;

		return await showModal<void>({
			modalId: 'NotificationsFilter',
			component: defineAsyncComponent(() => import('./NotificationsFilter.vue')),
			props: {
				filters,
				replaceRoute,
			},
			size: 'sm',
		});
	}
}
