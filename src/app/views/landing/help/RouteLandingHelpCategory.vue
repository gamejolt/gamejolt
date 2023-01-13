<script lang="ts">
import { computed } from '@vue/reactivity';
import { ref } from '@vue/runtime-core';
import { useRoute } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppHelpGroup from '../../../components/help/AppHelpGroup.vue';
import HelpCategory from '../../../components/help/category/category.model';
import HelpPage from '../../../components/help/page/page.model';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: false,
		deps: { params: ['category'] },
		resolver: () => Api.sendRequest(`/web/help/categories`),
	}),
	components: { AppHelpGroup },
};
</script>

<script lang="ts" setup>
interface PayloadCategory {
	category: HelpCategory;
	pages: HelpPage[];
}

const route = useRoute();

const categories = ref<PayloadCategory[]>([]);

const currentCategory = computed(() =>
	categories.value.find(x => x.category.url === route.params.category)
);

const currentPage = computed(() => {
	if (currentCategory.value && route.params.page) {
		return currentCategory.value.pages.find(x => x.url === route.params.page);
	}
});

createAppRoute({
	routeTitle: computed(() => currentCategory.value?.category.name || $gettext(`Help Docs`)),
	onResolved({ payload }) {
		categories.value = [];
		for (const categoryData of payload.categories) {
			categories.value.push({
				category: new HelpCategory(categoryData.category),
				pages: HelpPage.populate(categoryData.pages),
			});
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
						<nav class="breadcrumb _mobile-nav">
							<ul>
								<li>
									<RouterLink
										:to="{
											name: 'landing.help',
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
											name: 'landing.help.category',
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
											name: 'landing.help.page',
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
							v-for="category of categories"
							:key="category.category.id"
							class="_category"
						>
							<h3 class="sans-margin-top">{{ category.category.name }}</h3>
							<div>
								<nav class="platform-list">
									<ul>
										<li
											v-for="page of category.pages"
											:key="page.id"
											class="_page"
										>
											<RouterLink
												:to="{
													name: 'landing.help.page',
													params: {
														category: category.category.url,
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
					<router-view v-if="$route.params.page" />
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

<style lang="stylus" scoped>
._category
	margin-bottom: 48px

	& > h3
		font-size: 18px
		text-transform: uppercase

._page > a
	margin-bottom: -12px

._mobile-nav
	margin-bottom: 12px
</style>
