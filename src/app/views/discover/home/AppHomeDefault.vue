<script lang="ts" setup>
import { PropType } from 'vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppCreatorsList from '../../../../_common/creator/AppCreatorsList.vue';
import { FiresidePostModel } from '../../../../_common/fireside/post/post-model';
import { RealmModel } from '../../../../_common/realm/realm-model';
import AppUserCreatorBadge from '../../../../_common/user/creator/AppUserCreatorBadge.vue';
import { FeaturedItemModel } from '../../../components/featured-item/featured-item.model';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import AppDiscoverHomeBanner from './_home-default/AppDiscoverHomeBanner.vue';
import AppDiscoverHomeRealms from './_home-default/AppDiscoverHomeRealms.vue';

defineProps({
	isBootstrapped: {
		type: Boolean,
	},
	featuredItem: {
		type: Object as PropType<FeaturedItemModel>,
		default: null,
	},
	featuredCommunities: {
		type: Array as PropType<CommunityModel[]>,
		default: () => [],
	},
	featuredRealms: {
		type: Array as PropType<RealmModel[]>,
		default: () => [],
	},
	creatorPosts: {
		type: Array as PropType<FiresidePostModel[]>,
		default: () => [],
	},
});

const cardColumnsDesktop = 4;
const cardColumnsSm = 3;
const cardColumnsXs = 2;
</script>

<template>
	<AppShellPageBackdrop>
		<AppDiscoverHomeBanner :is-loading="!isBootstrapped" :item="featuredItem" />

		<section class="section">
			<div v-if="!isBootstrapped || creatorPosts.length" class="-content-row container">
				<h2 class="-content-row-header">
					<AppUserCreatorBadge size="lg" />
					{{ $gettext(`Game Jolt Creators`) }}
					<br />
					<small>{{
						$gettext(`Follow and support your favorite creators on Game Jolt!`)
					}}</small>
				</h2>

				<AppCreatorsList
					:is-loading="!isBootstrapped"
					:posts="creatorPosts"
					list-type="grid"
					:grid-columns-desktop="cardColumnsDesktop"
					:grid-columns-sm="cardColumnsSm"
					:grid-columns-xs="cardColumnsXs"
				/>
			</div>

			<AppDiscoverHomeRealms
				:is-loading="!isBootstrapped"
				:realms="featuredRealms"
				:grid-columns-desktop="cardColumnsDesktop"
				:grid-columns-sm="cardColumnsSm"
				:grid-columns-xs="cardColumnsXs"
			>
				<template #header>
					<h2 class="-content-row-header">
						{{ $gettext(`Realms`) }}
						<br />
						<small>{{
							$gettext(
								`Realms bring all the content around a particular topic or interest into a single place for you to browse.`
							)
						}}</small>
					</h2>
				</template>
			</AppDiscoverHomeRealms>
		</section>
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
.-content-row-header
	margin: 60px 0 20px

.section > ::v-deep(.-content-row:first-of-type) .-content-row-header
	margin-top: 0
</style>
