<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import { Meta } from '../../../../_common/meta/meta-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { $gettext } from '../../../../_common/translate/translate.service';
import { kFontSizeLarge } from '../../../../_styles/variables';
import AppHelpGroup from '../../../components/help/AppHelpGroup.vue';
import HelpCategory from '../../../components/help/category/category.model';
import HelpPage from '../../../components/help/page/page.model';
import {
	routeLandingHelpCategory,
	routeLandingHelpIndex,
	routeLandingHelpPage,
} from './help.route';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: false,
		deps: { params: ['category'] },
		resolver: () => Api.sendRequest(`/web/help/categories`),
	}),
};
</script>

<script lang="ts" setup>
interface PayloadCategory {
	category: HelpCategory;
	pages: HelpPage[];
}

const route = useRoute();

const categories = ref([]) as Ref<PayloadCategory[]>;

const currentCategory = computed(() =>
	categories.value.find(x => x.category.url === route.params.category)
);

const currentPage = computed(() => {
	if (currentCategory.value && route.params.page) {
		return currentCategory.value.pages.find(x => x.url === route.params.page);
	}
});

const routeTitle = computed(
	() => (currentCategory.value?.category.name || '') + ' ' + $gettext(`Help Docs`).trim()
);

createAppRoute({
	routeTitle,
	onResolved({ payload }) {
		categories.value = [];
		for (const categoryData of payload.categories) {
			categories.value.push({
				category: new HelpCategory(categoryData.category),
				pages: HelpPage.populate(categoryData.pages),
			});
		}

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
</script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-lg-3 col-sm-12">
					<div v-if="Screen.isMobile">
						<nav
							class="breadcrumb"
							:style="{
								marginBottom: `12px`,
							}"
						>
							<ul>
								<li>
									<RouterLink
										:to="{
											name: routeLandingHelpIndex.name,
										}"
									>
										{{ $gettext(`Help Docs`) }}
									</RouterLink>
									<AppJolticon
										icon="chevron-right"
										class="breadcrumb-separator"
									/>
								</li>
								<li>
									<RouterLink
										:to="{
											name: routeLandingHelpCategory.name,
											params: {
												category: currentCategory?.category.url,
											},
										}"
									>
										{{ currentCategory?.category.name }}
									</RouterLink>
									<AppJolticon
										v-if="currentPage"
										icon="chevron-right"
										class="breadcrumb-separator"
									/>
								</li>
								<li v-if="currentPage">
									<RouterLink
										:to="{
											name: routeLandingHelpPage.name,
											params: {
												category: currentCategory?.category.url,
												page: currentPage.url,
											},
										}"
									>
										{{ currentPage?.title }}
									</RouterLink>
								</li>
							</ul>
						</nav>
					</div>
					<template v-else>
						<div
							v-for="{ category, pages } of categories"
							:key="category.id"
							class="anim-fade-in-right stagger"
							:style="{
								marginBottom: `48px`,
							}"
						>
							<h3
								class="sans-margin-top"
								:style="{
									fontSize: `${kFontSizeLarge}px`,
								}"
							>
								{{ category.name }}
							</h3>
							<div>
								<nav class="platform-list">
									<ul>
										<li v-for="page of pages" :key="page.id">
											<RouterLink
												:style="{
													marginBottom: `-12px`,
												}"
												:to="{
													name: routeLandingHelpPage.name,
													params: {
														category: category.url,
														page: page.url,
													},
												}"
												active-class="active"
											>
												{{ page.title }}
											</RouterLink>
										</li>
									</ul>
								</nav>
							</div>
						</div>
					</template>
				</div>
				<div class="col-lg-9 col-sm-12">
					<RouterView v-if="$route.params.page" />
					<template v-else-if="currentCategory">
						<div class="row">
							<div class="col-lg-9 col-sm-12">
								<AppHelpGroup
									:category="currentCategory.category"
									:pages="currentCategory.pages"
								/>
							</div>
						</div>
					</template>
				</div>
			</div>
		</div>
	</section>
</template>
