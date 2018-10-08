import { RouteConfig } from 'vue-router';
import { routeDashGamesManageGameDescription } from './description/description.route';
import { routeDashGamesManageGameDesign } from './design/design.route';
import { routeDashGamesManageGameDetails } from './details/details.route';
import { routeDashGamesManageGameLinkedAccountsLinkCallback } from './linked-accounts/link-callback/link-callback.route';
import { routeDashGamesManageGameLinkedAccounts } from './linked-accounts/linked-accounts.route';
import { routeDashGamesManageGameMaturity } from './maturity/maturity.route';
import { routeDashGamesManageGameMusic } from './music/music.route';
import { routeDashGamesManageGameOverview } from './overview/overview.route';
import { routeDashGamesManageGamePackagesAdd } from './packages/add/add.route';
import { routeDashGamesManageGamePackagesEdit } from './packages/edit/edit.route';
import { routeDashGamesManageGamePackagesList } from './packages/list/list.route';
import { routeDashGamesManageGamePackageReleaseEdit } from './packages/release/edit/edit.route';
import { routeDashGamesManageGameSettings } from './settings/settings.route';
import { routeDashGamesManageGameWizardFinish } from './wizard-finish/wizard-finish.route';

export const routeDashGamesManageGame: RouteConfig = {
	path: '/dashboard/games/:id(\\d+)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashGamesManageGame" */ './game'),
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
		routeDashGamesManageGameLinkedAccounts,
		routeDashGamesManageGameLinkedAccountsLinkCallback,
	],
};
