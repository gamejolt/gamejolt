import { RouteConfig } from 'vue-router';

export const routeDashCommunitiesManageWizardFinish: RouteConfig = {
	name: 'dash.communities.manage.wizard-finish',
	path: 'wizard-finish',
	component: () =>
		import(/* webpackChunkName: "routeDashCommunitiesManageWizardFinish" */ './wizard-finish'),
};
