import { initRouter } from '../../lib/gj-lib-client/utils/router';
import { routeNewUser } from './new-user/new-user.flow';

const routes = [routeNewUser];
export const router = initRouter(routes);
