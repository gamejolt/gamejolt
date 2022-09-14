<script lang="ts" setup>
import { PropType } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import { configRealms } from '../../../../_common/config/config.service';
import AppCreatorsList from '../../../../_common/creator/AppCreatorsList.vue';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Realm } from '../../../../_common/realm/realm-model';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppUserCreatorBadge from '../../../../_common/user/creator/AppUserCreatorBadge.vue';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import AppFiresideBadge from '../../../components/fireside/badge/badge.vue';
import { AppAuthJoinLazy } from '../../../components/lazy';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import AppDiscoverHomeBanner from './_home-default/AppDiscoverHomeBanner.vue';
import AppDiscoverHomeCommunities from './_home-default/AppDiscoverHomeCommunities.vue';
import AppDiscoverHomeRealms from './_home-default/AppDiscoverHomeRealms.vue';

defineProps({
	isBootstrapped: {
		type: Boolean,
	},
	featuredItem: {
		type: Object as PropType<FeaturedItem>,
		default: null,
	},
	featuredCommunities: {
		type: Array as PropType<Community[]>,
		default: () => [],
	},
	featuredFireside: {
		type: Object as PropType<Fireside>,
		default: null,
	},
	featuredRealms: {
		type: Array as PropType<Realm[]>,
		default: () => [],
	},
	creatorPosts: {
		type: Array as PropType<FiresidePost[]>,
		default: () => [],
	},
});

const { user } = useCommonStore();
</script>

<template>
	<AppShellPageBackdrop>
		<AppDiscoverHomeBanner :is-loading="!isBootstrapped" :item="featuredItem" />

		<section class="section">
			<template v-if="featuredFireside">
				<div class="-content-row container">
					<div class="text-center">
						<h2 class="section-header">
							<AppTranslate>Featured Fireside</AppTranslate>
						</h2>
						<p>
							<AppTranslate>
								Stream together with your friends in firesides!
							</AppTranslate>
						</p>
						<hr class="underbar underbar-center" />
					</div>

					<div class="row">
						<div class="col-lg-10 col-centered">
							<AppFiresideBadge :fireside="featuredFireside" show-preview />
						</div>
					</div>
				</div>

				<br />
			</template>

			<div v-if="!isBootstrapped || creatorPosts.length" class="-content-row container">
				<h2 class="-content-row-header">
					<AppUserCreatorBadge size="lg" />
					<AppTranslate>Game Jolt Creators</AppTranslate>
				</h2>

				<AppCreatorsList
					:is-loading="!isBootstrapped"
					:posts="creatorPosts"
					list-type="grid"
				/>
			</div>

			<AppDiscoverHomeRealms
				v-if="configRealms.value"
				:is-loading="!isBootstrapped"
				:realms="featuredRealms"
			>
				<template #header>
					<h2 class="-content-row-header">Realms</h2>
				</template>
			</AppDiscoverHomeRealms>

			<AppDiscoverHomeCommunities
				:is-loading="!isBootstrapped"
				:communities="featuredCommunities"
			>
				<template #header>
					<h2 class="-content-row-header">Communities</h2>
				</template>
			</AppDiscoverHomeCommunities>
		</section>

		<section v-if="!user" class="section fill-offset">
			<div class="container">
				<h2 class="section-header text-center">
					<AppTranslate>Join Game Jolt</AppTranslate>
				</h2>

				<div class="text-center">
					<p class="lead">
						<AppTranslate>Do you love games as much as we do?</AppTranslate>
					</p>
				</div>

				<hr class="underbar underbar-center" />
				<br />

				<div class="row">
					<div class="col-sm-6 col-md-5 col-lg-4 col-centered">
						<AppAuthJoinLazy />
					</div>
				</div>
			</div>
		</section>
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
.-content-row-header
	margin: 60px 0 20px

.section > ::v-deep(.-content-row:first-of-type) .-content-row-header
	margin-top: 0
</style>
