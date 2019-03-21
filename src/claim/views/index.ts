import { initRouter } from 'game-jolt-frontend-lib/utils/router';
import { routeKey } from './key/key.route';
import { routeRetrieve } from './retrieve/retrieve.route';
import { routeSentKey } from './sent-key/sent-key.route';

const routes = [routeKey, routeRetrieve, routeSentKey];
export const router = initRouter(routes);
