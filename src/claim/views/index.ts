import { initRouter } from '../../lib/gj-lib-client/utils/router';
import { routeSentKey } from './sent-key/sent-key.route';
import { routeRetrieve } from './retrieve/retrieve.route';
import { routeKey } from './key/key.route';

const routes = [routeKey, routeRetrieve, routeSentKey];
export const router = initRouter(routes);
