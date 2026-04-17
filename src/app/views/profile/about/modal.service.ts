import { defineAsyncComponent, markRaw } from 'vue';

import { ProfileQuickLink } from '~app/views/profile/overview/shortcut/AppProfileShortcuts.vue';
import { ProfileRouteStore } from '~app/views/profile/RouteProfile.vue';
import { showModal } from '~common/modal/modal.service';

export async function showProfileAboutModal({
	routeStore,
	quickLinks,
}: {
	routeStore: ProfileRouteStore;
	quickLinks: ProfileQuickLink[];
}) {
	return await showModal<void>({
		modalId: 'ProfileAbout',
		component: defineAsyncComponent(
			() => import('~app/views/profile/about/AppProfileAboutModal.vue')
		),
		size: 'sm',
		props: {
			// Don't let Vue automatically unwrap this.
			routeStore: markRaw(routeStore),
			quickLinks,
		},
	});
}
