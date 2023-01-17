<script lang="ts">
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import AppOnHover from '../../../../_common/on/AppOnHover.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { kThemeFg } from '../../../../_common/theme/variables';
import { $gettext } from '../../../../_common/translate/translate.service';
import { styleWhen } from '../../../../_styles/mixins';
import AppHelpSearch from '../../../components/help/AppHelpSearch.vue';
import HelpPage from '../../../components/help/page/page.model';
import { illNoComments } from '../../../img/ill/illustrations';
import { routeLandingHelpPage } from './help.route';

export default {
	...defineAppRouteOptions({
		cache: false,
		lazy: false,
		deps: { query: ['q'] },
		resolver: ({ route }) => Api.sendRequest(`/web/help/search?q=${route.query.q}`),
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const pages = ref<HelpPage[]>([]);

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
			<div class="row">
				<div class="col-lg-6 col-sm-12 col-centered">
					<h2 class="section-header text-center">
						{{ $gettext(`Search results for...`) }}
					</h2>

					<AppHelpSearch :query="initialQuery" />
				</div>
			</div>
		</div>
	</section>

	<section class="section">
		<div class="container">
			<template v-if="!hasResults">
				<AppIllustration :asset="illNoComments">
					<p>
						{{ $gettext(`No results were found for your search.`) }}
					</p>
				</AppIllustration>
			</template>
			<template v-else>
				<div v-for="page of pages" :key="page.id">
					<AppOnHover v-slot="{ binding, hovered }">
						<RouterLink
							v-bind="binding"
							:to="{
								name: routeLandingHelpPage.name,
								params: { category: page.help_category.url, page: page.url },
							}"
						>
							<h3 :style="{ marginTop: 0 }">
								{{ page.title }}
								<AppJolticon
									icon="chevron-right"
									:style="{
										transition: `transform 0.15s ease`,
										...styleWhen(hovered, {
											transform: `translateX(12px)`,
										}),
									}"
								/>
							</h3>
							<div :style="{ color: kThemeFg }">
								<AppContentViewer :source="page.subline_content" />
							</div>
						</RouterLink>
					</AppOnHover>
					<hr />
				</div>
			</template>
		</div>
	</section>
</template>
