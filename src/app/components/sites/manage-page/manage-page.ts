// import { Component, Input, OnInit } from 'ng-metadata/core';
// import * as template from '!html-loader!./manage-page.component.html';
// import './manage-page.component.styl';

// import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
// import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppNavTabList } from '../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { FormOnInit } from '../../../../lib/gj-lib-client/components/form-vue/form.service';

// @Component({
// 	selector: 'gj-sites-manage-page',
// 	template,
// })
// export class SitesManagePageComponent implements OnInit {
// 	@Input() site: Site;
// 	@Input() game?: Game;

// 	tab: 'template' | 'static' | 'domain' = 'template';

// 	get staticEnabled() {
// 		return this.site.status === Site.STATUS_ACTIVE && this.site.is_static;
// 	}

// 	get templateEnabled() {
// 		return this.site.status === Site.STATUS_ACTIVE && !this.site.is_static;
// 	}

// 	ngOnInit() {
// 		this.tab = this.staticEnabled ? 'static' : 'template';
// 	}

// 	disable() {
// 		return this.site.$deactivate();
// 	}
// }

import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./manage-page.html?style=./manage-page.styl';
import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppSitesManagePageTemplate } from './template';
import { AppSitesManagePageStatic } from './static';
import { AppSitesManagePageDomain } from './domain';

@View
@Component({
	components: {
		AppNavTabList,
		AppJolticon,
		AppSitesManagePageTemplate,
		AppSitesManagePageStatic,
		AppSitesManagePageDomain,
	},
	directives: {
		AppTooltip,
	},
})
export class AppSitesManagePage extends Vue implements FormOnInit {
	@Prop(Site) site: Site;
	@Prop(Game) game?: Game;

	tab: 'template' | 'static' | 'domain' = 'template';

	get staticEnabled() {
		return this.site.status === Site.STATUS_ACTIVE && this.site.is_static;
	}

	get templateEnabled() {
		return this.site.status === Site.STATUS_ACTIVE && !this.site.is_static;
	}

	onInit() {
		this.tab = this.staticEnabled ? 'static' : 'template';
	}

	disable() {
		return this.site.$deactivate();
	}
}
