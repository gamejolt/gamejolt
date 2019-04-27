import { initRouter } from 'game-jolt-frontend-lib/utils/router';
import { routeContent } from './content/content.route';

const routes = [routeContent];
export const router = initRouter(routes);
