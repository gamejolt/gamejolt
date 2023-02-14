import { RouteRecordRaw } from 'vue-router';
import { routeDashGamesManageGameDescription } from './description/description.route';
import { routeDashGamesManageGameDesign } from './design/design.route';
import { routeDashGamesManageGameDetails } from './details/details.route';
import { routeDashGamesManageGameMaturity } from './maturity/maturity.route';
import { routeDashGamesManageGameMusic } from './music/music.route';
import { routeDashGamesManageGameOverview } from './overview/overview.route';
import { routeDashGamesManageGamePackagesAdd } from './packages/add/add.route';
import { routeDashGamesManageGamePackagesEdit } from './packages/edit/edit.route';
import { routeDashGamesManageGamePackagesList } from './packages/list/list.route';
import { routeDashGamesManageGamePackageReleaseEdit } from './packages/release/edit/edit.route';
import { routeDashGamesManageGameSettings } from './settings/settings.route';
import { routeDashGamesManageGameWizardFinish } from './wizard-finish/wizard-finish.route';

export const routeDashGamesManageGame: RouteRecordRaw = {
	path: '',
	component: () => import('./game.vue'),
	children: [
		routeDashGamesManageGameOverview,
		routeDashGamesManageGameDetails,
		routeDashGamesManageGameDescription,
		routeDashGamesManageGameDesign,
		routeDashGamesManageGameMusic,
		routeDashGamesManageGameSettings,
		routeDashGamesManageGamePackagesList,
		routeDashGamesManageGamePackagesAdd,
		routeDashGamesManageGamePackagesEdit,
		routeDashGamesManageGamePackageReleaseEdit,
		routeDashGamesManageGameMaturity,
		routeDashGamesManageGameWizardFinish,
	],
};
