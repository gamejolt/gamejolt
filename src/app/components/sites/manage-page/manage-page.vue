<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { GameModel } from '../../../../_common/game/game.model';
import AppNavTabList from '../../../../_common/nav/tab-list/tab-list.vue';
import { SiteModel, SiteStatus } from '../../../../_common/site/site-model';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
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
		AppTooltip: vAppTooltip,
	},
})
export default class AppSitesManagePage extends Vue {
	@Prop(Object) site!: SiteModel;
	@Prop(Object) game?: GameModel;

	get tab() {
		return this.$route.params.siteTab || 'template';
	}

	get staticEnabled() {
		return this.site.status === SiteStatus.Active && this.site.is_static;
	}

	get templateEnabled() {
		return this.site.status === SiteStatus.Active && !this.site.is_static;
	}

	disable() {
		return this.site.$deactivate();
	}
}
</script>

<template>
	<div>
		<AppNavTabList>
			<ul>
				<li>
					<router-link
						:to="{
							name: $route.name,
							params: {
								siteTab: null,
							},
						}"
						:class="{ active: tab === 'template' }"
					>
						<span v-if="templateEnabled" class="page-active-tab">
							<AppJolticon icon="checkbox" />
						</span>
						<AppTranslate>Use a Template</AppTranslate>
					</router-link>
				</li>
				<li>
					<router-link
						:to="{
							name: $route.name,
							params: {
								siteTab: 'static',
							},
						}"
						:class="{ active: tab === 'static' }"
					>
						<span v-if="staticEnabled" class="page-active-tab">
							<AppJolticon icon="checkbox" />
						</span>
						<AppTranslate>Upload Your Own</AppTranslate>
					</router-link>
				</li>
			</ul>
			<ul class="pull-right">
				<li>
					<router-link
						:to="{
							name: $route.name,
							params: {
								siteTab: 'domain',
							},
						}"
						:class="{ active: tab === 'domain' }"
					>
						<AppTranslate>Custom Domain</AppTranslate>
					</router-link>
				</li>
			</ul>
		</AppNavTabList>

		<div
			v-if="(templateEnabled && tab === 'template') || (staticEnabled && tab === 'static')"
			class="row"
		>
			<div class="col-sm-9">
				<div v-if="templateEnabled" class="alert full-bleed-xs">
					<p>
						<strong>
							<AppTranslate>Your site is turned on and active.</AppTranslate>
						</strong>
					</p>
					<p>
						<AppTranslate>
							You can customize it using the site editor below.
						</AppTranslate>
					</p>
				</div>

				<div v-if="staticEnabled" class="alert full-bleed-xs">
					<p>
						<strong>
							<AppTranslate>Your static site is turned on and active.</AppTranslate>
						</strong>
					</p>
					<p>
						<AppTranslate>
							You can upload new static site builds at any time.
						</AppTranslate>
					</p>
				</div>
			</div>
			<div class="col-sm-3">
				<div class="clearfix">
					<AppButton
						v-app-tooltip="
							$gettext(
								`This will turn your Site off completely and it will no longer be accessible.`
							)
						"
						class="pull-right"
						@click="disable()"
					>
						<AppTranslate>Disable</AppTranslate>
					</AppButton>
				</div>
				<br />
			</div>
		</div>

		<AppSitesManagePageTemplate
			v-if="tab === 'template'"
			:site="site"
			:enabled="templateEnabled"
			:static-enabled="staticEnabled"
		/>

		<AppSitesManagePageStatic
			v-else-if="tab === 'static'"
			:site="site"
			:enabled="staticEnabled"
			:template-enabled="templateEnabled"
		/>

		<AppSitesManagePageDomain v-else-if="tab === 'domain'" :site="site" :game="game" />
	</div>
</template>

<style lang="stylus" scoped>
.active-tab
	.jolticon
		theme-prop('color', 'link')
		margin: 0
		margin-right: 5px
</style>
