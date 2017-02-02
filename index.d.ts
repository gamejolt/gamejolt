/// <reference path="./node_modules/ng-metadata/manual_typings/angular-extension.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/oclazyload.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/webpack.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/environment.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/html.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/angular-gettext.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/angular.d.ts" />

import Stripe = require( 'Stripe' );

declare global {
	export interface Window {
		_: _.LoDashStatic;
		_gjStartTime: number;
		Stripe: Stripe;
		gapi: any;
	}

	declare function $import<T>( path: string ): Promise<T>;
}
