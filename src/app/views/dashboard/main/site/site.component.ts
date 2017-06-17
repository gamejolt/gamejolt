import { Component, OnInit, Input, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./site.component.html';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Site } from '../../../../../lib/gj-lib-client/components/site/site-model';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';

@Component({
	selector: 'route-dashboard-site',
	template,
})
export class RouteSiteComponent implements OnInit {
	@Input() payload: any;
	@Input() game: Game;

	site?: Site;

	constructor(
		@Inject('gettextCatalog') gettextCatalog: ng.gettext.gettextCatalog
	) {
		Meta.title = gettextCatalog.getString('Manage Site');
	}

	ngOnInit() {
		this.site = new Site(this.payload.site);
	}
}
