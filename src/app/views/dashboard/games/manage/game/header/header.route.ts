import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGameHeader: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.header',
	path: 'header',
	props: true,
	component: () => asyncComponentLoader( $import( './header' ) ),
};
