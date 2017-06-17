import { Component, Input, OnInit } from 'ng-metadata/core';
import * as template from '!html-loader!./manage-page.component.html';
import './manage-page.component.styl';

import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';

@Component({
	selector: 'gj-sites-manage-page',
	template,
})
export class SitesManagePageComponent implements OnInit {
	@Input() site: Site;
	@Input() game?: Game;

	tab: 'template' | 'static' | 'domain' = 'template';

	get staticEnabled() {
		return this.site.status === Site.STATUS_ACTIVE && this.site.is_static;
	}

	get templateEnabled() {
		return this.site.status === Site.STATUS_ACTIVE && !this.site.is_static;
	}

	ngOnInit() {
		this.tab = this.staticEnabled ? 'static' : 'template';
	}

	disable() {
		return this.site.$deactivate();
	}
}
