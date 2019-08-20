import { Community } from '../../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../../_common/modal/base';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import FormCommunityThumbnail from '../thumbnail.vue';

@Component({
	components: {
		FormCommunityThumbnail,
	},
})
export default class AppCommunityThumbnailModal extends BaseModal {
	@Prop(Community)
	community!: Community;

	// We don't want to close the modal after they've uploaded a thumbnail since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousThumbnailId: number | null = null;

	created() {
		if (this.community.thumbnail) {
			this.previousThumbnailId = this.community.thumbnail.id;
		}
	}

	onSubmit(community: Community) {
		const newThumbnailId = (community.thumbnail && community.thumbnail.id) || null;
		if (this.previousThumbnailId === newThumbnailId) {
			this.modal.resolve(this.community);
		}
		this.previousThumbnailId = newThumbnailId;
	}
}
