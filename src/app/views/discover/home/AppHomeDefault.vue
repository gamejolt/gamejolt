<script lang="ts" setup>
import { PropType } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import AppCreatorsList from '../../../../_common/creator/AppCreatorsList.vue';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import { Realm } from '../../../../_common/realm/realm-model';
import AppUserCreatorBadge from '../../../../_common/user/creator/AppUserCreatorBadge.vue';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import AppFiresideBadge from '../../../components/fireside/badge/badge.vue';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import AppDiscoverHomeBanner from './_home-default/AppDiscoverHomeBanner.vue';
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

const cardColumnsDesktop = 4;
const cardColumnsSm = 3;
const cardColumnsXs = 2;
</script>

<template>
	<AppShellPageBackdrop>
		<AppDiscoverHomeBanner :is-loading="!isBootstrapped" :item="featuredItem" />

		<section class="section">
			<template v-if="featuredFireside">
				<div class="-content-row container">
					<div class="text-center">
						<h2 class="section-header">
							{{ $gettext(`Featured livestream`) }}
						</h2>
						<p>
							{{
								$gettext(
									`Stream together with your friends and creators in firesides!`
								)
							}}
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
