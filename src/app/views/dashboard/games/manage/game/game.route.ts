import { RouteConfig } from 'vue-router';

import { routeDashGamesManageGameOverview } from './overview/overview.route';
import { routeDashGamesManageGameDetails } from './details/details.route';
import { routeDashGamesManageGameDescription } from './description/description.route';
import { routeDashGamesManageGameMusic } from './music/music.route';
import { routeDashGamesManageGamePackagesList } from './packages/list/list.route';
import { routeDashGamesManageGamePackagesAdd } from './packages/add/add.route';
import { routeDashGamesManageGamePackagesEdit } from './packages/edit/edit.route';
import { routeDashGamesManageGameSettings } from './settings/settings.route';
import { routeDashGamesManageGameMaturity } from './maturity/maturity.route';
import { routeDashGamesManageGameWizardFinish } from './wizard-finish/wizard-finish.route';
import { routeDashGamesManageGamePackageReleaseEdit } from './packages/release/edit/edit.route';
import { routeDashGamesManageGameDesign } from './design/design.route';
import { routeDashGamesManageGameLinkedAccounts } from './linked-accounts/linked-accounts.route';
import { routeDashGamesManageGameLinkedAccountsLinkCallback } from './linked-accounts/link-callback/link-callback.route';

export const routeDashGamesManageGame: RouteConfig = {
	path: '/dashboard/games/:id(\\d+)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGame" */ './game'),
	children: [
		routeDashGamesManageGameOverview,
		routeDashGamesManageGameLinkedAccounts,
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
		routeDashGamesManageGameLinkedAccountsLinkCallback,
	],
};
