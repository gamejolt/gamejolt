import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';
import { routeLegalPrivacy } from './privacy/privacy.route';
import { routeLegalTerms } from './terms/terms.route';

export const routeLegal: VueRouter.RouteConfig = {
	name: 'legal',
	path: '',
	props: true,
	component: () => asyncComponentLoader($import('./legal')),
	children: [routeLegalPrivacy, routeLegalTerms],
};
