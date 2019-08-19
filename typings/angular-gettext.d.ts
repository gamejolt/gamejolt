import * as ng from 'angular';

//  getString: function (string, scope, context) {
declare namespace ng.gettext {
	interface gettextCatalog {
		getString(string: string, scope?: any, context?: string): string;
	}
}
