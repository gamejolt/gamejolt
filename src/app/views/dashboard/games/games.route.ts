import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';
import { routeDashGamesManage } from './manage/manage.route';

export const routeDashGames: VueRouter.RouteConfig = {
	path: 'games',
	props: true,
	component: () => asyncComponentLoader( $import( './games' ) ),
	children: [
		routeDashGamesManage,
	],
};
