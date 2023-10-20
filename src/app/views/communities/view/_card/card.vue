<script lang="ts">
import { Inject, Options, Vue } from 'vue-property-decorator';
import AppCommunityCardBase from '../../../../../_common/community/card-base/AppCommunityCardBase.vue';
import AppEditableThumbnail from '../_editable-thumbnail/editable-thumbnail.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';

@Options({
	components: {
		AppCommunityCardBase,
		AppEditableThumbnail,
	},
})
export default class AppCommunitiesViewCard extends Vue {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	get community() {
		return this.routeStore.community;
	}
}
</script>

<template>
	<AppCommunityCardBase :community="community" overflow>
		<template #thumbnail>
			<AppEditableThumbnail />
		</template>
	</AppCommunityCardBase>
</template>
