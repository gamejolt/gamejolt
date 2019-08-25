import { initRouter } from '../../utils/router';
import { routeContent } from './content/content.route';

const routes = [routeContent];
export const router = initRouter(routes);
