<script lang="ts">
import { computed, ref } from '@vue/reactivity';
import { Api } from '../../../../_common/api/api.service';
import AppPostCard from '../../../../_common/fireside/post/card/AppPostCard.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppHelpGroup from '../../../components/help/AppHelpGroup.vue';
import AppHelpSearch from '../../../components/help/AppHelpSearch.vue';
import HelpCategory from '../../../components/help/category/category.model';
import HelpPage from '../../../components/help/page/page.model';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: false,
		deps: {},
		resolver: () => Api.sendRequest('/web/help'),
	}),
	components: {
		AppScrollScroller,
		AppHelpGroup,
		AppPostCard,
		AppHelpSearch,
	},
};
</script>

<script lang="ts" setup>
interface PayloadFeatured {
	category: HelpCategory;
	pages: HelpPage[];
}

const featuredPages = ref<PayloadFeatured[]>([]);
const broadcastPosts = ref<FiresidePost[]>([]);

createAppRoute({
	routeTitle: computed(() => $gettext(`Help Docs`)),
	onResolved({ payload }) {
		featuredPages.value = [];
		for (const categoryData of payload.featured) {
			featuredPages.value.push({
				category: new HelpCategory(categoryData.category),
				pages: HelpPage.populate(categoryData.pages),
			});
		}

		broadcastPosts.value = FiresidePost.populate(payload.broadcasts);
	},
});
</script>

<template>
	<div>
		<section class="section fill-offset">
			<div class="container">
				<h2 class="section-header">
					{{ $gettext(`Find what you're looking for`) }}
				</h2>
				<div class="row">
					<div class="col-lg-6 col-sm-12">
						<AppHelpSearch />
					</div>
				</div>
			</div>
		</section>

		<section v-if="featuredPages && featuredPages.length" class="section">
			<div class="container">
				<div class="row">
					<div
						v-for="featuredCategory of featuredPages"
						:key="featuredCategory.category.id"
						class="col-lg-6 col-sm-12"
					>
						<AppHelpGroup
							:category="featuredCategory.category"
							:pages="featuredCategory.pages"
						/>
					</div>
				</div>
			</div>
		</section>

		<section v-if="broadcastPosts && broadcastPosts.length" class="section fill-offset">
			<div class="container">
				<h2 class="section-header">
					{{ $gettext(`Recent updates`) }}
				</h2>

				<transition>
					<AppScrollScroller class="_recent-container" thin horizontal>
						<AppPostCard
							v-for="broadcastPost of broadcastPosts"
							:key="broadcastPost.id"
							class="_post-card anim-fade-in-enlarge"
							:post="broadcastPost"
							:source="'help'"
							with-user
						/>
					</AppScrollScroller>
				</transition>
			</div>
		</section>

		<section class="section">
			<div class="container">
				<!-- TODO: real content -->
				<h2 class="section-header">Contact</h2>
				<div>- follow @gamejolt for updates on Game Jolt</div>
				<div>- follow @gjsupport for support related information</div>
				<div>
					Questions regarding accounts, send an email to contact@gamejolt.com, or read
					this help page: link
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
._recent-container
	// Inline block overflow x:
	overflow-x: scroll
	white-space: nowrap

._post-card
	height: 280px
	display: inline-block
	margin-right: 24px
</style>
