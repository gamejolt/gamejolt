import VueRouter from 'vue-router';

import { routeDashGamesManageGameOverview } from './overview/overview.route';
import { routeDashGamesManageGameDetails } from './details/details.route';
import { routeDashGamesManageGameDescription } from './description/description.route';
import { routeDashGamesManageGameHeader } from './header/header.route';
import { routeDashGamesManageGameMedia } from './media/media.route';
import { routeDashGamesManageGameMusic } from './music/music.route';
import { routeDashGamesManageGameThumbnail } from './thumbnail/thumbnail.route';
import { routeDashGamesManageGamePackagesList } from './packages/list/list.route';
import { routeDashGamesManageGamePackagesAdd } from './packages/add/add.route';
import { routeDashGamesManageGamePackagesEdit } from './packages/edit/edit.route';
import { routeDashGamesManageGameSettings } from './settings/settings.route';
import { routeDashGamesManageGameMaturity } from './maturity/maturity.route';
import { routeDashGamesManageGameWizardFinish } from './wizard-finish/wizard-finish.route';
import { routeDashGamesManageGamePackageReleaseEdit } from './packages/release/edit/edit.route';

export const routeDashGamesManageGame: VueRouter.RouteConfig = {
	path: '/dashboard/games/:id(\\d+)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGame" */ './game'),
	children: [
		routeDashGamesManageGameOverview,
		routeDashGamesManageGameDetails,
		routeDashGamesManageGameDescription,
		routeDashGamesManageGameHeader,
		routeDashGamesManageGameMedia,
		routeDashGamesManageGameMusic,
		routeDashGamesManageGameThumbnail,
		routeDashGamesManageGameSettings,
		routeDashGamesManageGamePackagesList,
		routeDashGamesManageGamePackagesAdd,
		routeDashGamesManageGamePackagesEdit,
		routeDashGamesManageGamePackageReleaseEdit,
		routeDashGamesManageGameMaturity,
		routeDashGamesManageGameWizardFinish,
	],
};
