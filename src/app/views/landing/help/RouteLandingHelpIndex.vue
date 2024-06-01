<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppPostCard from '../../../../_common/fireside/post/card/AppPostCard.vue';
import { FiresidePostModel } from '../../../../_common/fireside/post/post-model';
import AppLinkExternal from '../../../../_common/link/AppLinkExternal.vue';
import { Meta } from '../../../../_common/meta/meta-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppHelpGroup from '../../../components/help/AppHelpGroup.vue';
import { HelpCategoryModel } from '../../../components/help/category/category.model';
import { HelpPageModel } from '../../../components/help/page/page.model';
import { routeDiscoverGamesListSection } from '../../discover/games/list/list.route';
import { routeLegalAds } from '../../legal/ads/ads.route';
import { routeLegalCookies } from '../../legal/cookies/cookies.route';
import { routeLegalPrivacy } from '../../legal/privacy/privacy.route';
import { routeLegalTerms } from '../../legal/terms/terms.route';
import { routeProfileOverviewFeed } from '../../profile/overview/feed/feed.route';
import { routeLandingAbout } from '../about/about.route';
import { routeLandingCreators } from '../creators/creators.route';
import { routeLandingGameApi } from '../game-api/game-api.route';
import { routeLandingMarketplace } from '../marketplace/marketplace.route';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: false,
		reloadOn: 'never',
		resolver: () => Api.sendRequest('/web/help'),
	}),
	components: { AppLinkExternal },
};
</script>

<script lang="ts" setup>
interface PayloadFeatured {
	category: HelpCategoryModel;
	pages: HelpPageModel[];
}

const featuredPages = ref([]) as Ref<PayloadFeatured[]>;
const broadcastPosts = ref([]) as Ref<FiresidePostModel[]>;
const searchSuggestions = ref<string[]>([]);

const routeTitle = computed(() => $gettext(`Help Docs`));

createAppRoute({
	routeTitle,
	onResolved({ payload }) {
		featuredPages.value = [];
		for (const categoryData of payload.featured) {
			featuredPages.value.push({
				category: new HelpCategoryModel(categoryData.category),
				pages: HelpPageModel.populate(categoryData.pages),
			});
		}

		broadcastPosts.value = FiresidePostModel.populate(payload.broadcasts);
		searchSuggestions.value = payload.searchSuggestions;

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
				<div class="col-lg-3 col-sm-12 _footer-column">
					<h3 class="sans-margin-top _footer-header">{{ $gettext(`Company`) }}</h3>
					<div>
						<RouterLink :to="{ name: routeLandingAbout.name }">
							{{ $gettext(`About Game Jolt`) }}
						</RouterLink>
					</div>
					<div>
						<AppLinkExternal href="mailto:contact@gamejolt.com">
							{{ $gettext(`Contact`) }}
						</AppLinkExternal>
					</div>
					<div>
						<AppLinkExternal href="https://angel.co/company/gjolt/jobs">
							{{ $gettext(`Career`) }}
						</AppLinkExternal>
					</div>
					<div>
						<RouterLink
							:to="{
								name: routeDiscoverGamesListSection.name,
								params: { section: null },
							}"
						>
							{{ $gettext(`Store`) }}
						</RouterLink>
					</div>
				</div>
				<div class="col-lg-3 col-sm-12 _footer-column">
					<h3 class="sans-margin-top _footer-header">
						{{ $gettext(`Creators`) }}
					</h3>
					<div>
						<RouterLink :to="{ name: routeLandingCreators.name }">
							{{ $gettext(`Creators`) }}
						</RouterLink>
					</div>
					<div>
						<RouterLink :to="{ name: routeLandingMarketplace.name }">
							{{ $gettext(`Game marketplace`) }}
						</RouterLink>
					</div>
					<div>
						<RouterLink :to="{ name: routeLandingGameApi.name }">
							{{ $gettext(`Game API`) }}
						</RouterLink>
					</div>
				</div>
				<div class="col-lg-3 col-sm-12 _footer-column">
					<h3 class="sans-margin-top _footer-header">{{ $gettext(`Socials`) }}</h3>
					<div>
						<RouterLink
							:to="{
								name: routeProfileOverviewFeed.name,
								params: { username: 'gamejolt' },
							}"
						>
							{{ $gettext(`Follow Game Jolt`) }}
						</RouterLink>
					</div>
					<div>
						<RouterLink
							:to="{
								name: routeProfileOverviewFeed.name,
								params: { username: 'gjsupport' },
							}"
						>
							{{ $gettext(`Follow Game Jolt Support`) }}
						</RouterLink>
					</div>
					<div>
						<AppLinkExternal href="https://twitter.com/gamejolt">
							{{ $gettext(`Twitter`) }}
						</AppLinkExternal>
					</div>
					<div>
						<AppLinkExternal href="https://www.tiktok.com/@gamejolt">
							{{ $gettext(`TikTok`) }}
						</AppLinkExternal>
					</div>
					<div>
						<AppLinkExternal href="https://www.instagram.com/thegamejolt/">
							{{ $gettext(`Instagram`) }}
						</AppLinkExternal>
					</div>
				</div>
				<div class="col-lg-3 col-sm-12 _footer-column">
					<h3 class="sans-margin-top _footer-header">{{ $gettext(`Legal`) }}</h3>
					<div>
						<RouterLink :to="{ name: routeLegalTerms.name }">
							{{ $gettext(`Terms of service`) }}
						</RouterLink>
					</div>
					<div>
						<RouterLink :to="{ name: routeLegalPrivacy.name }">
							{{ $gettext(`Privacy policy`) }}
						</RouterLink>
					</div>
					<div>
						<RouterLink :to="{ name: routeLegalCookies.name }">
							{{ $gettext(`Cookie policy`) }}
						</RouterLink>
					</div>
					<div>
						<RouterLink :to="{ name: routeLegalAds.name }">
							{{ $gettext(`Advertisements`) }}
						</RouterLink>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
._recent-container
	@media $media-md-up
		padding: 8px

._footer-column > div
	line-height: 28px
	a
		color: var(--theme-fg-muted)

		&:hover
			color: var(--theme-fg-link)

._footer-header
	@media $media-mobile
		margin-top: 24px
</style>
