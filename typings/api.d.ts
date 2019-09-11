import Axios from 'axios';

declare module 'axios' {
	export interface AxiosRequestConfig {
		ignoreLoadingBar?: boolean;
	}
}
