/**
 * This module allows us to export client-related code safely. It'll get cleaned
 * out when doing a web build and all the exports will be undefined. In the
 * client, they'll be defined with their proper types. Use these exports when
 * interfacing with client code outside of client-specific code.
 */

import AppNoop from '../../../_common/AppNoop.vue';

const AppClientShell = GJ_IS_DESKTOP_APP ? (await import('./AppClientShell.vue')).default : AppNoop;
const AppClientStatusBar = GJ_IS_DESKTOP_APP
	? (await import('./status-bar/AppClientStatusBar.vue')).default
	: AppNoop;
const LocalDbGameMod = GJ_IS_DESKTOP_APP
	? (await import('./local-db/game/game.model')).LocalDbGame
	: null;

const AppClientPackageCardButtons = GJ_IS_DESKTOP_APP
	? (await import('./hooks/AppClientPackageCardButtons.vue')).default
	: null;

export { AppClientStatusBar, AppClientShell, LocalDbGameMod, AppClientPackageCardButtons };
