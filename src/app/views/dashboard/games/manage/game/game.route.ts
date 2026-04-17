import { RouteRecordRaw } from 'vue-router';

import { routeDashGamesManageGameDescription } from '~app/views/dashboard/games/manage/game/description/description.route';
import { routeDashGamesManageGameDesign } from '~app/views/dashboard/games/manage/game/design/design.route';
import { routeDashGamesManageGameDetails } from '~app/views/dashboard/games/manage/game/details/details.route';
import { routeDashGamesManageGameMaturity } from '~app/views/dashboard/games/manage/game/maturity/maturity.route';
import { routeDashGamesManageGameMusic } from '~app/views/dashboard/games/manage/game/music/music.route';
import { routeDashGamesManageGameOverview } from '~app/views/dashboard/games/manage/game/overview/overview.route';
import { routeDashGamesManageGamePackagesAdd } from '~app/views/dashboard/games/manage/game/packages/add/add.route';
import { routeDashGamesManageGamePackagesEdit } from '~app/views/dashboard/games/manage/game/packages/edit/edit.route';
import { routeDashGamesManageGamePackagesList } from '~app/views/dashboard/games/manage/game/packages/list/list.route';
import { routeDashGamesManageGamePackageReleaseEdit } from '~app/views/dashboard/games/manage/game/packages/release/edit/edit.route';
import { routeDashGamesManageGameSettings } from '~app/views/dashboard/games/manage/game/settings/settings.route';
import { routeDashGamesManageGameWizardFinish } from '~app/views/dashboard/games/manage/game/wizard-finish/wizard-finish.route';

export const routeDashGamesManageGame: RouteRecordRaw = {
	path: '',
	component: () => import('~app/views/dashboard/games/manage/game/RouteDashGamesManageGame.vue'),
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
