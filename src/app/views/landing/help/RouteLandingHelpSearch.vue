<script lang="ts">
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppHelpSearch from '../../../components/help/AppHelpSearch.vue';
import HelpPage from '../../../components/help/page/page.model';

export default {
	...defineAppRouteOptions({
		cache: false,
		lazy: false,
		deps: { query: ['q'] },
		resolver: ({ route }) => Api.sendRequest(`/web/help/search?q=${route.query.q}`),
	}),
	components: { AppContentViewer, AppHelpSearch },
};
</script>

<script lang="ts" setup>
const pages = ref<HelpPage[]>([]);
const route = useRoute();

const routeTitle = computed(() => $gettext(`Help Docs Search Results`));

createAppRoute({
	routeTitle,
	onResolved({ payload }) {
		pages.value = HelpPage.populate(payload.pages);

		if (payload.meta) {
			const meta = payload.meta;

			Meta.description = meta.description;
			Meta.fb = payload.fb || {};
			Meta.fb.title = routeTitle.value;
			Meta.twitter = payload.twitter || {};
			Meta.twitter.title = routeTitle.value;
		}
	},
});

const initialQuery = computed(() => {
	if (typeof route.query.q === 'string') {
		return route.query.q;
	}
	return '';
});

const hasResults = computed(() => pages.value && pages.value.length > 0);
</script>

<template>
	<section class="section fill-offset">
		<div class="container">
			<h2 class="section-header">
				{{
					$gettextInterpolate(`Search results for "%{ query }"`, { query: initialQuery })
				}}
			</h2>

			<div class="row">
				<div class="col-lg-6 col-sm-12">
					<AppHelpSearch :query="initialQuery" />
				</div>
			</div>
		</div>
	</section>

	<section class="section">
		<div class="container">
			<div v-if="!hasResults">
				<div class="well fill-offset">
					{{ $gettext(`We couldn't find anything for your query.`) }}
				</div>
			</div>
			<div v-else>
				<div v-for="page of pages" :key="page.id" class="_result">
					<RouterLink
						:to="{
							name: 'landing.help.page',
							params: { category: page.help_category.url, page: page.url },
						}"
					>
						<h3 class="_result-header">
							{{ page.title }}
							<AppJolticon icon="chevron-right" class="_result-header-go-icon" />
						</h3>
						<div class="_page-subline">
							<AppContentViewer :source="page.subline_content" />
						</div>
					</RouterLink>
					<hr />
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
._page-subline
	color: var(--theme-fg)

._result-header
	margin-top: 0

._result:hover
	._result-header
		._result-header-go-icon
			transform: translateX(12px)

._result-header-go-icon
	transition: transform 0.15s ease
</style>
