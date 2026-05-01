import { routeKey } from '~claim/views/key/key.route';
import { routeRetrieve } from '~claim/views/retrieve/retrieve.route';
import { routeSentKey } from '~claim/views/sent-key/sent-key.route';
import { initRouter } from '~utils/router';

export function createClaimRouter() {
	return initRouter([routeKey, routeRetrieve, routeSentKey]);
}
