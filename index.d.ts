/// <reference path="./typings/index.d.ts" />
/// <reference path="./node_modules/ng-metadata/manual_typings/globals.d.ts" />

interface Window {
	_: _.LoDashStatic;
	moment: moment.MomentStatic;
	_gjStartTime: number;
	Stripe: StripeStatic;
	gapi: any;
}

declare var global: any;

declare var GJ_ENVIRONMENT: 'development' | 'production';
declare var GJ_BUILD_TYPE: 'development' | 'production';

// Have to add this in for the moment.
declare module angular {
	interface IModule {
		controller(...args: ProvideSpreadType[]): IModule;
	}
}
