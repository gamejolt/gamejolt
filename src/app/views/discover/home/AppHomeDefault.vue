<script lang="ts" setup>
import { PropType } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import { configRealms } from '../../../../_common/config/config.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
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

			<div v-if="configRealms.value" style="margin-bottom: 96px">
				<div class="container">
					<h2>Realms</h2>
				</div>

				<AppDiscoverHomeRealms :is-loading="!isBootstrapped" :realms="featuredRealms" />
			</div>

			<AppDiscoverHomeCommunities
				:is-loading="!isBootstrapped"
				:communities="featuredCommunities"
			/>
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
