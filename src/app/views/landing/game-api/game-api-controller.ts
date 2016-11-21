import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
// import { Meta } from './../../../../lib/gj-lib-client/components/meta/meta-service';

@Injectable()
export class GameApiCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		// @Inject( 'Meta' ) meta: Meta,
		@Inject( 'gettextCatalog' ) gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
		app.title = gettextCatalog.getString( 'Game API' );

		// meta.description = payload.metaDescription;
		// meta.fb = payload.fb;
		// meta.twitter = payload.twitter;
		// meta.fb.image = meta.twitter.image = '/app/views/landing/marketplace/social.png';
	}
}
