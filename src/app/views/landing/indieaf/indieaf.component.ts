import { Component, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./indieaf.component.html';
import '../../../styles/pages/indieaf.styl';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { App } from '../../../app-service';

@Component({
	selector: 'route-landing-indieaf',
	template,
})
export class RouteIndieafComponent
{
	state: 'bogus' | 'indie' = 'bogus';

	constructor(
		@Inject( 'App' ) public app: App,
	)
	{
		Meta.title = `Get Indie.AF // Freakin' legit customizable game sites`;
		Meta.description = `Build your own customizable site with an indie.af domain through Game Jolt Sites!`;

		Meta.fb = {
			type: 'website',
			title: Meta.title,
			description: Meta.description,
		};

		Meta.twitter = {
			card: 'summary_large_image',
			title: Meta.title,
			description: Meta.description,
		};

		Meta.fb.image = Meta.twitter.image = require( './social.png' );
	}
}
