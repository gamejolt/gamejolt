import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../../../utils/vue';
import AppCommunityCardBase from '../../../../../_common/community/card-base/card-base.vue';
import { isEditingCommunity } from '../../../../../_common/community/community.model';
import { CommunityThumbnailModal } from '../../../../components/forms/community/thumbnail/modal/modal.service';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';
import AppEditableThumbnail from '../_editable-thumbnail/editable-thumbnail.vue';

@Component({
	components: {
		AppCommunityCardBase,
		AppEditableThumbnail,
	},
})
export default class AppCommunitiesViewCard extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;
	@Prop(propOptional(Boolean, false)) overflow!: boolean;

	get community() {
		return this.routeStore.community;
	}

	get isEditing() {
		return isEditingCommunity(this.$route);
	}

	showEditAvatar() {
		CommunityThumbnailModal.show(this.routeStore.community);
	}
}
