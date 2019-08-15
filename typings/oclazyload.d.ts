import * as oc from 'oclazyload';

declare module 'oclazyload' {
	export interface ILazyLoad {
		inject(moduleName?: string | string[]): Promise<any>;
	}
}
