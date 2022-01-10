<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../../client/store/index';
import { numberSort } from '../../../../../utils/array';
import { propOptional, propRequired } from '../../../../../utils/vue';
import AppCommunityCardPlaceholder from '../../../../../_common/community/card-placeholder/card-placeholder.vue';
import AppCommunityCard from '../../../../../_common/community/card/card.vue';
import AppCommunityChunkPlaceholder from '../../../../../_common/community/chunk/chunk-placeholder.vue';
import AppCommunityChunk from '../../../../../_common/community/chunk/chunk.vue';
import { Community } from '../../../../../_common/community/community.model';
import { Screen } from '../../../../../_common/screen/screen-service';

const EmphasizedCommunityIDs = [
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
	@Prop(propRequired(Array)) communities!: Community[];
	@Prop(propOptional(Boolean, false)) isLoading!: boolean;

	@State app!: Store['app'];

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
				<translate>Browse Communities</translate>
			</h2>

			<p>
				<translate>
					Find a community to create and explore gaming videos, fanart, discussions and
					more!
				</translate>
			</p>

			<hr class="underbar underbar-center" />
		</div>

		<div v-if="isLoading" class="row">
			<div v-for="i of 8" :key="i" class="col-sm-6 col-md-4 col-lg-3">
				<app-community-card-placeholder />
			</div>
		</div>
		<template v-else>
			<template v-if="filteredCommunities.top.length > 0">
				<div class="row">
					<template v-for="community of filteredCommunities.top" :key="community.id">
						<app-community-chunk class="-chunk" :community="community" />
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
					<app-community-card
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
			<app-button
				v-app-track-event="`home:more-btn:communities`"
				:to="{ name: 'discover.communities' }"
			>
				<translate>Browse More Communities</translate>
			</app-button>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-chunk
	margin-bottom: $grid-gutter-width
</style>
