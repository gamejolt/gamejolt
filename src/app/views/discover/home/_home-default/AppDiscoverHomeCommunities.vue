<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { numberSort } from '../../../../../utils/array';
import AppCommunityCardPlaceholder from '../../../../../_common/community/card-placeholder/card-placeholder.vue';
import AppCommunityCard from '../../../../../_common/community/card/card.vue';
import AppCommunityChunkPlaceholder from '../../../../../_common/community/chunk/AppCommunityChunkPlaceholder.vue';
import AppCommunityChunk from '../../../../../_common/community/chunk/chunk.vue';
import { Community } from '../../../../../_common/community/community.model';
import { Screen } from '../../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../../_common/store/common-store';

const EmphasizedCommunityIDs =
	GJ_ENVIRONMENT === 'development'
		? [2, 3, 9]
		: [
				// Minecraft
				15,
				// Pokemon
				7,
				// Arts n' Crafts
				1462,
				// Game Dev
				57,
				// 3D Art
				4269,
		  ];

@Options({
	components: {
		AppCommunityCard,
		AppCommunityCardPlaceholder,
		AppCommunityChunkPlaceholder,
		AppCommunityChunk,
	},
})
export default class AppDiscoverHomeCommunities extends Vue {
	@Prop({ type: Array, required: true }) communities!: Community[];
	@Prop({ type: Boolean, default: false }) isLoading!: boolean;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	get filteredCommunities() {
		const localCommunities = this.communities.map(i => i);
		const emphasizedCommunities: Community[] = [];
		const normalCommunities: Community[] = [];

		localCommunities.forEach(i => {
			const index = EmphasizedCommunityIDs.indexOf(i.id);
			if (index === -1) {
				normalCommunities.push(i);
			} else {
				emphasizedCommunities.push(i);
			}
		});

		emphasizedCommunities.sort((a, b) => {
			const indexA = EmphasizedCommunityIDs.indexOf(a.id);
			const indexB = EmphasizedCommunityIDs.indexOf(b.id);
			return numberSort(indexA, indexB);
		});

		return {
			top: emphasizedCommunities,
			other: normalCommunities,
		};
	}

	get slicedCommunities() {
		return this.filteredCommunities.other.slice(0, Screen.isMobile ? 18 : 24);
	}
}
</script>

<template>
	<div class="container">
		<div class="text-center">
			<h2 class="section-header">
				<AppTranslate>Browse Communities</AppTranslate>
			</h2>

			<p>
				<AppTranslate>
					Find a community to create and explore gaming videos, fanart, discussions and
					more!
				</AppTranslate>
			</p>

			<hr class="underbar underbar-center" />
		</div>

		<div v-if="isLoading" class="row">
			<div v-for="i of 8" :key="i" class="col-sm-6 col-md-4 col-lg-3">
				<AppCommunityCardPlaceholder />
			</div>
		</div>
		<template v-else>
			<template v-if="filteredCommunities.top.length > 0">
				<div class="row">
					<template v-for="community of filteredCommunities.top" :key="community.id">
						<AppCommunityChunk class="-chunk" :community="community" />
					</template>
				</div>
			</template>

			<br />

			<div class="row">
				<div
					v-for="community of slicedCommunities"
					:key="community.id"
					class="col-sm-6 col-md-4 col-lg-3 anim-fade-in"
				>
					<AppCommunityCard
						v-app-track-event="`home:communities:click`"
						:community="community"
						track-goto
						elevate
					/>
				</div>
			</div>
		</template>

		<br />

		<div class="page-cut">
			<AppButton
				v-app-track-event="`home:more-btn:communities`"
				:to="{ name: 'discover.communities' }"
			>
				<AppTranslate>Browse More Communities</AppTranslate>
			</AppButton>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-chunk
	margin-bottom: $grid-gutter-width
</style>
