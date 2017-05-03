import { Component, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./placement.component.html';

import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { isPrerender } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Model } from '../../../../lib/gj-lib-client/components/model/model.service';

@Component({
	selector: 'gj-ad-placement',
	template,
})
export class AdPlacementComponent
{
	@Input() resource?: Model;

	@Input() hiddenXs = false;
	@Input() hiddenSm = false;
	@Input() hiddenDesktop = false;

	@Input() visibleXs = false;
	@Input() visibleSm = false;
	@Input() visibleDesktop = false;

	Screen = Screen;

	get isVisible()
	{
		if (
			GJ_IS_CLIENT
			|| isPrerender
			|| (this.resource && this.resource instanceof Game && !this.resource._should_show_ads)
		) {
			return false;
		}

		let visibleXs = true;
		let visibleSm = true;
		let visibleDesktop = true;

		if ( this.visibleXs || this.visibleSm || this.visibleDesktop ) {
			visibleXs = this.visibleXs;
			visibleSm = this.visibleSm;
			visibleDesktop = this.visibleDesktop;
		}
		else {
			visibleXs = !this.hiddenXs;
			visibleSm = !this.hiddenSm;
			visibleDesktop = !this.hiddenDesktop;
		}

		return (Screen.isXs && visibleXs)
			|| (Screen.isSm && visibleSm)
			|| (Screen.isDesktop && visibleDesktop)
			;
	}

	constructor()
	{
	}
}
