import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../../app-service';
import { Meta } from './../../../../lib/gj-lib-client/components/meta/meta-service';

@Injectable()
export class DevlogsCtrl
{
	constructor(
		@Inject( 'App' ) app: App,
		@Inject( 'Meta' ) meta: Meta,
	)
	{
		app.title = 'Devlogs';

		// Meta.description = payload.metaDescription;
		// Meta.fb = payload.fb;
		// Meta.twitter = payload.twitter;
		// Meta.fb.image = Meta.twitter.image = '/app/views/landing/marketplace/social.png';
	}
}
