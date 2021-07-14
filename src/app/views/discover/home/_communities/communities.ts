import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../../client/store/index';
import { numberSort } from '../../../../../utils/array';
import { propOptional, propRequired } from '../../../../../utils/vue';
import AppCommunityCardPlaceholder from '../../../../../_common/community/card-placeholder/card-placeholder.vue';
import AppCommunityCard from '../../../../../_common/community/card/card.vue';
import AppCommunityChunkPlaceholder from '../../../../../_common/community/chunk/chunk-placeholder.vue';
import AppCommunityChunk from '../../../../../_common/community/chunk/chunk.vue';
import { Community } from '../../../../../_common/community/community.model';
import { configDiscoverCommunityChunks } from '../../../../../_common/config/config.service';
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

@Component({
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

	readonly configDiscoverCommunityChunks = configDiscoverCommunityChunks;

	get filteredCommunities() {
		const localCommunities = this.communities.map(i => i);
		const emphasizedCommunities: Community[] = [];
		const normalCommunities: Community[] = [];

		localCommunities.forEach(i => {
			const index = EmphasizedCommunityIDs.indexOf(i.id);
			if (index === -1 || !this.configDiscoverCommunityChunks.value) {
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
