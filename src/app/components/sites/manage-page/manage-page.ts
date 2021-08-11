import { Options, Prop, Vue } from 'vue-property-decorator';
import { Game } from '../../../../_common/game/game.model';
import AppNavTabList from '../../../../_common/nav/tab-list/tab-list.vue';
import { Site } from '../../../../_common/site/site-model';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppSitesManagePageDomain from './domain.vue';
import AppSitesManagePageStatic from './static.vue';
import AppSitesManagePageTemplate from './template.vue';

@Options({
	components: {
		AppNavTabList,
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
