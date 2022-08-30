<script lang="ts" setup>
import { PropType } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import { configChargedStickers, configRealms } from '../../../../_common/config/config.service';
import AppCreatorsList from '../../../../_common/creator/AppCreatorsList.vue';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Realm } from '../../../../_common/realm/realm-model';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
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
				<div class="container">
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

			<div
				v-if="configChargedStickers.value && (!isBootstrapped || creatorPosts.length)"
				class="container"
			>
				<h2 class="-content-section-header">Game Jolt Creators</h2>

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
					<h2 class="-content-section-header">Realms</h2>
				</template>
			</AppDiscoverHomeRealms>

			<AppDiscoverHomeCommunities
				:is-loading="!isBootstrapped"
				:communities="featuredCommunities"
			>
				<template #header>
					<h2 class="-content-section-header">Communities</h2>
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
.-content-section-header
	margin: 120px 0 40px

.section > ::v-deep(.container:first-of-type) .-content-section-header
	margin-top: 40px
</style>
