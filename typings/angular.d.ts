import * as ng from 'angular';

declare module 'angular' {
	export interface IModule {
		controller(...args: any[]): IModule;
	}

	export interface IDocumentService {
		[k: number]: HTMLDocument;
	}

	export interface IAugmentedJQuery {
		[k: number]: HTMLElement;
	}
}
