import { Injectable, Inject } from 'ng-metadata/core';
import { App } from '../../../app-service';

@Injectable()
export class GameApiDocCtrl {
	constructor(
		@Inject('App') app: App,
		@Inject('gettextCatalog') gettextCatalog: ng.gettext.gettextCatalog,
		@Inject('path') public path: string,
		@Inject('nav') public nav: any,
	) {
		app.title = gettextCatalog.getString('Game API Documentation');
	}

	inPath(url: string) {
		return this.path.indexOf(url) !== -1;
	}
}
