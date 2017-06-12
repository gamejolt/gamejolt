import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./empty.html';

@View
@Component({})
export default class RouteEmpty extends Vue
{
}

export const routeFallbacks: VueRouter.RouteConfig[] = [
	{ name: 'styleguide', path: '/styleguide', component: RouteEmpty },
	{ path: '/dashboard', component: RouteEmpty, children: [
		{ name: 'dash.main.site', path: 'site', component: RouteEmpty },
		{ name: 'dash.withdraw-funds', path: 'withdraw-funds', component: RouteEmpty },

		{ name: 'dash.games.add', path: 'games/add', component: RouteEmpty },
		{ path: 'games/:id(\\d+)', component: RouteEmpty, children: [
			{ name: 'dash.games.manage.game.maturity', path: 'maturity', component: RouteEmpty },
			{ name: 'dash.games.manage.game.settings', path: 'settings', component: RouteEmpty },
			{ name: 'dash.games.manage.game.wizard-finish', path: 'wizard-finish', component: RouteEmpty },

			{ name: 'dash.games.manage.game.packages.add', path: 'packages/add', component: RouteEmpty },
			{ name: 'dash.games.manage.game.packages.list', path: 'packages', component: RouteEmpty },
			{ name: 'dash.games.manage.game.packages.edit', path: 'packages/:packageId(\\d+)', component: RouteEmpty },
			{ name: 'dash.games.manage.game.packages.edit.widget', path: 'packages/:packageId(\\d+)/widget', component: RouteEmpty },
			{ name: 'dash.games.manage.game.packages.release.edit', path: 'packages/:packageId(\\d+)/releases/:releaseId(\\d+)/edit', component: RouteEmpty },

			{ name: 'dash.games.manage.site', path: 'site', component: RouteEmpty },

			{ name: 'dash.games.manage.key-groups.list', path: 'keys', component: RouteEmpty },
			{ name: 'dash.games.manage.key-groups.edit', path: 'keys/edit/:keyGroupId(\\d+)', component: RouteEmpty },

			{ name: 'dash.games.manage.devlog.feed', path: 'devlog/:tab?', component: RouteEmpty },

			{ name: 'dash.games.manage.api.settings', path: 'api/settings', component: RouteEmpty },
			{ name: 'dash.games.manage.api.trophies.list', path: 'api/trophies', component: RouteEmpty },
			{ name: 'dash.games.manage.api.data-storage.items.list', path: 'api/data-storage/items', component: RouteEmpty },
			{ name: 'dash.games.manage.api.data-storage.items.view', path: 'api/data-storage/items/:item(\\d+)', component: RouteEmpty },
			{ name: 'dash.games.manage.api.scoreboards.list', path: 'api/scoreboards', component: RouteEmpty },
			{ name: 'dash.games.manage.api.scoreboards.scores.list', path: 'api/scoreboards/:table(\\d+)/scores', component: RouteEmpty },
			{ name: 'dash.games.manage.api.scoreboards.scores.user.list', path: 'api/scoreboards/:table(\\d+)/user/:user(\\d+)', component: RouteEmpty },
			{ name: 'dash.games.manage.api.scores.view', path: 'api/scores/:score(\\d+)', component: RouteEmpty },
		] },

		{ name: 'dash.account.financials', path: 'financials', component: RouteEmpty },
		{ name: 'dash.account.linked-accounts', path: 'linked-accounts', component: RouteEmpty },
		{ name: 'dash.account.linked-accounts.linking', path: 'linked-accounts/linking', component: RouteEmpty },
		{ name: 'dash.account.linked-accounts.link-callback', path: 'linked-accounts/link-callback/:provider', component: RouteEmpty },
	] },
];
