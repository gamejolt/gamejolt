<script lang="ts">
import { Inject, Options, Vue } from 'vue-property-decorator';
import { isEditingCommunity } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppEditableOverlay from '../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import { showCommunityThumbnailModal } from '../../../../components/forms/community/thumbnail/modal/modal.service';
import { routeCommunitiesViewEditDetails } from '../edit/details/details.route';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';

@Options({
	components: {
		AppEditableOverlay,
		AppCommunityThumbnailImg,
	},
})
export default class AppEditableThumbnail extends Vue {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	get community() {
		return this.routeStore.community;
	}

	get isEditing() {
		return isEditingCommunity(this.$route);
	}

	get canEdit() {
		return (
			this.isEditing &&
			this.routeStore.canEditMedia &&
			this.$route.name === routeCommunitiesViewEditDetails.name
		);
	}

	showEditAvatar() {
		showCommunityThumbnailModal(this.routeStore.community);
	}
}
</script>

<template>
	<AppEditableOverlay v-if="canEdit" class="-fill" @click="showEditAvatar()">
		<template #overlay>
			<AppTranslate>Change</AppTranslate>
		</template>
		<AppCommunityThumbnailImg :community="community" />
	</AppEditableOverlay>
	<router-link v-else :to="community.routeLocation">
		<AppCommunityThumbnailImg :community="community" />
	</router-link>
</template>
