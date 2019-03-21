import { initRouter } from 'game-jolt-frontend-lib/utils/router';
import { routePlayboxMain } from './main/main.route';
import { routePlayboxUnloaded } from './unloaded/unloaded.route';

const routes = [routePlayboxMain, routePlayboxUnloaded];
export const router = initRouter(routes);
