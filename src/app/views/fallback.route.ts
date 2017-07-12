import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./empty.html';

@View
@Component({})
export default class RouteEmpty extends Vue {}

export const routeFallbacks: VueRouter.RouteConfig[] = [
	{
		path: '/dashboard',
		component: RouteEmpty,
		children: [
			{ name: 'dash.main.site', path: 'site', component: RouteEmpty },
			{
				name: 'dash.withdraw-funds',
				path: 'withdraw-funds',
				component: RouteEmpty,
			},

			{ name: 'dash.games.add', path: 'games/add', component: RouteEmpty },
			{
				path: 'games/:id(\\d+)',
				component: RouteEmpty,
				children: [
					{
						name: 'dash.games.manage.game.wizard-finish',
						path: 'wizard-finish',
						component: RouteEmpty,
					},
					{
						name: 'dash.games.manage.game.packages.edit.widget',
						path: 'packages/:packageId(\\d+)/widget',
						component: RouteEmpty,
					},
					{
						name: 'dash.games.manage.game.packages.release.edit',
						path: 'packages/:packageId(\\d+)/releases/:releaseId(\\d+)/edit',
						component: RouteEmpty,
					},
					{
						name: 'dash.games.manage.site',
						path: 'site',
						component: RouteEmpty,
					},
				],
			},

			{
				name: 'dash.account.financials',
				path: 'financials',
				component: RouteEmpty,
			},
		],
	},
];
