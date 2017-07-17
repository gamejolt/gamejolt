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
			{ name: 'dash.games.add', path: 'games/add', component: RouteEmpty },
			{
				path: 'games/:id(\\d+)',
				component: RouteEmpty,
			},
		],
	},
];
