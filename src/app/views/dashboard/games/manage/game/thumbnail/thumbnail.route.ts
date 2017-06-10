import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDashGamesManageGameThumbnail: VueRouter.RouteConfig = {
	name: 'dash.games.manage.game.thumbnail',
	path: 'thumbnail',
	props: true,
	component: () => asyncComponentLoader( $import( './thumbnail' ) ),
};
