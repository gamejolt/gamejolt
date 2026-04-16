<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import AppSitesManagePageDomain from '~app/components/sites/manage-page/AppSitesManagePageDomain.vue';
import AppSitesManagePageStatic from '~app/components/sites/manage-page/AppSitesManagePageStatic.vue';
import AppSitesManagePageTemplate from '~app/components/sites/manage-page/AppSitesManagePageTemplate.vue';
import AppButton from '~common/button/AppButton.vue';
import { GameModel } from '~common/game/game.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppNavTabList from '~common/nav/tab-list/AppNavTabList.vue';
import { $deactivateSite, SiteModel, SiteStatus } from '~common/site/site-model';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	site: SiteModel;
	game?: GameModel;
};

const { site, game } = defineProps<Props>();

const route = useRoute();

const tab = computed(() => {
	return route.params.siteTab || 'template';
});

const staticEnabled = computed(() => {
	return site.status === SiteStatus.Active && site.is_static;
});

const templateEnabled = computed(() => {
	return site.status === SiteStatus.Active && !site.is_static;
});

function disable() {
	return $deactivateSite(site);
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
