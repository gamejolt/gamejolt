<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppPostCard from '../../../../_common/fireside/post/card/AppPostCard.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppHelpGroup from '../../../components/help/AppHelpGroup.vue';
import HelpCategory from '../../../components/help/category/category.model';
import HelpPage from '../../../components/help/page/page.model';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: false,
		deps: {},
		resolver: () => Api.sendRequest('/web/help'),
	}),
	components: {},
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

				<AppScrollScroller class="_recent-container" thin horizontal>
					<div
						:style="{
							display: 'flex',
							alignItems: 'flex-start',
							gap: '24px',
						}"
					>
						<AppPostCard
							v-for="broadcastPost of broadcastPosts"
							:key="broadcastPost.id"
							class="anim-fade-in-up stagger"
							:style="{
								width: `160px`,
								flex: `none`,
							}"
							:post="broadcastPost"
							source="help"
							with-user
							show-media-post-lead
						/>
					</div>
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
