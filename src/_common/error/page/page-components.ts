import Vue, { VueConstructor } from 'vue';
import ErrorPage400 from './page-400.vue';
import ErrorPage403 from './page-403.vue';
import ErrorPage404 from './page-404.vue';
import ErrorPage500 from './page-500.vue';
import ErrorPageOffline from './page-offline.vue';

export const ErrorPages: { [id: string]: VueConstructor<Vue> } = {
	400: ErrorPage400,
	403: ErrorPage403,
	404: ErrorPage404,
	500: ErrorPage500,
	offline: ErrorPageOffline,
};
