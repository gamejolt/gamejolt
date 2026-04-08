import { defineAsyncComponent, markRaw } from 'vue';

import { showModal } from '../../../../_common/modal/modal.service';
import { ProfileQuickLink } from '../overview/shortcut/AppProfileShortcuts.vue';
import { ProfileRouteStore } from '../RouteProfile.vue';

export async function showProfileAboutModal({
	routeStore,
	quickLinks,
}: {
	routeStore: ProfileRouteStore;
	quickLinks: ProfileQuickLink[];
}) {
	return await showModal<void>({
		modalId: 'ProfileAbout',
		component: defineAsyncComponent(() => import('./AppProfileAboutModal.vue')),
		size: 'sm',
		props: {
			// Don't let Vue automatically unwrap this.
			routeStore: markRaw(routeStore),
			quickLinks,
		},
	});
}
