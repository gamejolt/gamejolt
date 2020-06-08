import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import AppCommunityCardBase from '../../../../../_common/community/card-base/card-base.vue';
import { isEditingCommunity } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import AppEditableOverlay from '../../../../../_common/editable-overlay/editable-overlay.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { CommunityThumbnailModal } from '../../../../components/forms/community/thumbnail/modal/modal.service';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';

@Component({
	components: {
		AppCommunityCardBase,
		AppEditableOverlay,
		AppMediaItemBackdrop,
		AppCommunityThumbnailImg,
	},
})
export default class AppCommunitiesViewCard extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	get community() {
		return this.routeStore.community;
	}

	get isEditing() {
		return isEditingCommunity(this.$route);
	}

	get canEditMedia() {
		return this.community.hasPerms('community-media');
	}

	showEditAvatar() {
		CommunityThumbnailModal.show(this.routeStore.community);
	}
}
