import { routeUpgrade } from '~client/views/upgrade/upgrade.route';
import { initRouter } from '~utils/router';

export function createClientRouter() {
	return initRouter([routeUpgrade]);
}
