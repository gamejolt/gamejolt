import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

interface NotificationsFilterModalOptions {
	filters: string[];
	replaceRoute?: boolean;
}

export async function showNotificationsFilterModal(options: NotificationsFilterModalOptions) {
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
