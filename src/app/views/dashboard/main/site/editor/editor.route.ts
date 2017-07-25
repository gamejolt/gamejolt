import VueRouter from 'vue-router';

export const routeDashMainSiteEditor: VueRouter.RouteConfig = {
	name: 'dash.main.site.editor',
	path: 'editor/:tab(theme|content)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashMainSiteEditor" */ './editor'),
};
