import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import AppNavTabList from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list.vue';
import { Site } from 'game-jolt-frontend-lib/components/site/site-model';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppSitesManagePageDomain from './domain.vue';
import AppSitesManagePageStatic from './static.vue';
import AppSitesManagePageTemplate from './template.vue';

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
export default class AppSitesManagePage extends Vue {
	@Prop(Site) site!: Site;
	@Prop(Game) game?: Game;

	get tab() {
		return this.$route.params.siteTab || 'template';
	}

	get staticEnabled() {
		return this.site.status === Site.STATUS_ACTIVE && this.site.is_static;
	}

	get templateEnabled() {
		return this.site.status === Site.STATUS_ACTIVE && !this.site.is_static;
	}

	disable() {
		return this.site.$deactivate();
	}
}
