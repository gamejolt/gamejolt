// import { Component, OnInit, Input, Inject } from 'ng-metadata/core';
// import * as template from '!html-loader!./site.component.html';

// import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
// import { Site } from '../../../../../lib/gj-lib-client/components/site/site-model';
// import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppSitesLinkCard } from '../../../../components/sites/link-card/link-card';
import { AppSitesManagePage } from '../../../../components/sites/manage-page/manage-page';

// @Component({
// 	selector: 'route-dashboard-site',
// 	template,
// })
// export class RouteSiteComponent implements OnInit {
// 	@Input() payload: any;
// 	@Input() game: Game;

// 	site?: Site;

// 	constructor(
// 		@Inject('gettextCatalog') gettextCatalog: ng.gettext.gettextCatalog
// 	) {
// 		Meta.title = gettextCatalog.getString('Manage Site');
// 	}

// 	ngOnInit() {
// 		this.site = new Site(this.payload.site);
// 	}
// }

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./site.html';
import { RouteResolve } from '../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Site } from '../../../../../lib/gj-lib-client/components/site/site-model';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';

@View
@Component({
	components: {
		AppSitesManagePage,
		AppSitesLinkCard,
	},
})
export default class RouteDashMainSite extends Vue {
	site?: Site = null as any;

	@RouteResolve()
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/sites');
	}

	routeInit() {
		Meta.title = this.$gettext('Manage Site');
	}

	routed() {
		this.site = new Site(this.$payload.site);
	}
}
