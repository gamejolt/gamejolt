import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';
import { routeDashGamesManageGameOverview } from './overview/overview.route';
import { routeDashGamesManageGameDetails } from './details/details.route';
import { routeDashGamesManageGameDescription } from './description/description.route';
import { routeDashGamesManageGameHeader } from './header/header.route';
import { routeDashGamesManageGameMedia } from './media/media.route';
import { routeDashGamesManageGameMusic } from './music/music.route';
import { routeDashGamesManageGameThumbnail } from './thumbnail/thumbnail.route';

export const routeDashGamesManageGame: VueRouter.RouteConfig = {
	path: '/dashboard/games/:id(\\d+)',
	props: true,
	component: () => asyncComponentLoader($import('./game')),
	children: [
		routeDashGamesManageGameOverview,
		routeDashGamesManageGameDetails,
		routeDashGamesManageGameDescription,
		routeDashGamesManageGameHeader,
		routeDashGamesManageGameMedia,
		routeDashGamesManageGameMusic,
		routeDashGamesManageGameThumbnail,
	],
};
