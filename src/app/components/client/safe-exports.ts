/**
 * This module allows us to export client-related code safely. It'll get cleaned
 * out when doing a web build and all the exports will be undefined. In the
 * client, they'll be defined with their proper types. Use these exports when
 * interfacing with client code outside of client-specific code.
 */

import { defineAsyncComponent } from 'vue';
import { Router } from 'vue-router';
import AppNoop from '../../../_common/AppNoop.vue';
import type { routeLibraryInstalled as routeLibraryInstalledType } from '../../views/library/installed/installed.route';
import type AppClientShellType from './AppClientShell.vue';
import type AppClientPackageCardButtonsType from './hooks/AppClientPackageCardButtons.vue';
import type { LocalDbGame as LocalDbGameType } from './local-db/game/game.model';
import type AppClientStatusBarType from './status-bar/AppClientStatusBar.vue';
import type { ClientSystemReportModal as ClientSystemReportModalType } from './system-report-modal/system-report-modal.service';

// Vue components
export let AppClientShell: typeof AppClientShellType = AppNoop as any;
export let AppClientStatusBar: typeof AppClientStatusBarType = AppNoop as any;
export let AppClientPackageCardButtons: typeof AppClientPackageCardButtonsType = AppNoop as any;

// Vue routes
export let routeLibraryInstalled: typeof routeLibraryInstalledType = null as any;

// Misc
export let ClientSystemReportModal: typeof ClientSystemReportModalType = null as any;
export let LocalDbGame: typeof LocalDbGameType = null as any;

export async function initSafeExportsForClient(router: Router) {
	if (!GJ_IS_DESKTOP_APP) {
		return;
	}

	// Vue components
	AppClientShell = defineAsyncComponent(
		async () => (await import('./AppClientShell.vue')).default
	);
	AppClientStatusBar = defineAsyncComponent(
		async () => (await import('./status-bar/AppClientStatusBar.vue')).default
	);
	AppClientPackageCardButtons = defineAsyncComponent(
		async () => (await import('./hooks/AppClientPackageCardButtons.vue')).default
	);

	// Vue routes
	routeLibraryInstalled = (await import('../../views/library/installed/installed.route'))
		.routeLibraryInstalled;

	router.addRoute('library', routeLibraryInstalled);

	// Misc
	ClientSystemReportModal = (await import('./system-report-modal/system-report-modal.service'))
		.ClientSystemReportModal;
	LocalDbGame = (await import('./local-db/game/game.model')).LocalDbGame;
}
