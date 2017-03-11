/// <reference path="./node_modules/ng-metadata/manual_typings/angular-extension.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/oclazyload.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/webpack.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/environment.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/html.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/angular-gettext.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/angular.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/vue.d.ts" />
/// <reference path="./src/lib/gj-lib-client/typings/vue/tooltip.d.ts" />


declare interface Window {
	_: _.LoDashStatic;
	_gjStartTime: number;
	Stripe: StripeStatic;
	gapi: any;
	jQuery: JQueryStatic;
}
