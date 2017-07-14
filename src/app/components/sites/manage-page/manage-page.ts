import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./manage-page.html?style=./manage-page.styl';

import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppNavTabList } from '../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppSitesManagePageDomain } from './domain';
import { AppSitesManagePageTemplate } from './template';
import { AppSitesManagePageStatic } from './static';

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
export class AppSitesManagePage extends Vue {
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
