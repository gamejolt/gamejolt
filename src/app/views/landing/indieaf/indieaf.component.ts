import { Component } from 'ng-metadata/core';
import * as template from '!html-loader!./indieaf.component.html';
import '../../../styles/pages/indieaf.styl';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';

@Component({
	selector: 'route-landing-indieaf',
	template,
})
export class RouteIndieafComponent
{
	constructor()
	{
		Meta.title = `Get Indie.AF // Freakin' legit customizable game sites`;

		Meta.description = `Build your own customizable site with an indie.af domain through Game Jolt Sites!`;
		// Meta.fb = this.payload.fb;
		// Meta.twitter = this.payload.twitter;
		// Meta.fb.image = Meta.twitter.image = require( './social.png' );
	}
}
