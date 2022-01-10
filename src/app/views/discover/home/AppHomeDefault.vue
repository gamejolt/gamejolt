<script lang="ts" setup>
import { PropType } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { useAppStore } from '../../../../_common/store/app-store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import AppFiresideBadge from '../../../components/fireside/badge/badge.vue';
import { AppAuthJoinLazy } from '../../../components/lazy';
import AppDiscoverHomeBanner from './_home-default/AppDiscoverHomeBanner.vue';
import AppDiscoverHomeCommunities from './_home-default/AppDiscoverHomeCommunities.vue';

const app = useAppStore();

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
});
</script>

<template>
	<div>
		<AppDiscoverHomeBanner :is-loading="!isBootstrapped" :item="featuredItem" />

		<section class="section fill-backdrop">
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

			<AppDiscoverHomeCommunities
				:is-loading="!isBootstrapped"
				:communities="featuredCommunities"
			/>
		</section>

		<section v-if="!app.user" class="section fill-offset">
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
	</div>
</template>
