import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import { isEditingCommunity } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import AppEditableOverlay from '../../../../../_common/editable-overlay/editable-overlay.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { CommunityThumbnailModal } from '../../../../components/forms/community/thumbnail/modal/modal.service';
import { routeCommunitiesViewEditDetails } from '../edit/details/details.route';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';

@Component({
	components: {
		AppEditableOverlay,
		AppMediaItemBackdrop,
		AppCommunityThumbnailImg,
	},
})
export default class AppEditableThumbnail extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

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
		CommunityThumbnailModal.show(this.routeStore.community);
	}
}
