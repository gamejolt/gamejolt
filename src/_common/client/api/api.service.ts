import Axios from 'axios';

export function initClientApiInterceptors() {
	Axios.interceptors.request.use(config => {
		config.headers = { ...config.headers, 'x-gj-client-version': GJ_VERSION };
		return config;
	});
}
