<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppPostCard from '../../../../_common/fireside/post/card/AppPostCard.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppPill from '../../../../_common/pill/AppPill.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppHelpGroup from '../../../components/help/AppHelpGroup.vue';
import AppHelpSearch from '../../../components/help/AppHelpSearch.vue';
import HelpCategory from '../../../components/help/category/category.model';
import HelpPage from '../../../components/help/page/page.model';
import { routeLandingHelpSearch } from './help.route';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: false,
		deps: {},
		resolver: () => Api.sendRequest('/web/help'),
	}),
	components: { AppPill },
};
</script>

<script lang="ts" setup>
interface PayloadFeatured {
	category: HelpCategory;
	pages: HelpPage[];
}

const featuredPages = ref([]) as Ref<PayloadFeatured[]>;
const broadcastPosts = ref([]) as Ref<FiresidePost[]>;
const searchSuggestions = ref<string[]>([]);

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
		searchSuggestions.value = payload.searchSuggestions;
	},
});
</script>

<template>
	<div>
		<section class="section fill-offset">
			<div class="container">
				<div class="row">
					<div class="col-lg-6 col-sm-12 col-centered">
						<h2 class="section-header text-center">
							{{ $gettext(`Find what you're looking for`) }}
						</h2>
						<AppHelpSearch />
						<div v-if="searchSuggestions?.length > 0" :style="{ 'margin-top': '16px' }">
							<AppPill
								v-for="suggestion of searchSuggestions"
								:key="suggestion"
								:to="{
									name: routeLandingHelpSearch.name,
									query: { q: suggestion },
								}"
								class="anim-fade-in stagger"
							>
								{{ suggestion }}
							</AppPill>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section v-if="featuredPages?.length" class="section">
			<div class="container">
				<div class="row">
					<div
						v-for="{ category, pages } of featuredPages"
						:key="category.id"
						class="col-lg-6 col-sm-12"
					>
						<AppHelpGroup :category="category" :pages="pages" />
					</div>
				</div>
			</div>
		</section>

		<section v-if="broadcastPosts?.length" class="section fill-offset">
			<div class="container">
				<h2 class="section-header">
					{{ $gettext(`Recent updates`) }}
				</h2>

				<AppScrollScroller
					class="_recent-container"
					:style="{
						// Inline block overflow x:
						overflowX: `scroll`,
						whiteSpace: `nowrap`,
					}"
					thin
					horizontal
				>
					<AppPostCard
						v-for="broadcastPost of broadcastPosts"
						:key="broadcastPost.id"
						class="anim-fade-in-up stagger"
						:style="{
							height: `280px`,
							display: `inline-block`,
							marginRight: `24px`,
						}"
						:post="broadcastPost"
						:source="'help'"
						with-user
					/>
				</AppScrollScroller>
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
	@media $media-md-up
		padding: 8px
</style>
