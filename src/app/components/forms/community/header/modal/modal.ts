import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../../_common/modal/base';
import FormCommunityHeader from '../header.vue';

@Component({
	components: {
		FormCommunityHeader,
	},
})
export default class AppCommunityHeaderModal extends BaseModal {
	@Prop(Community)
	community!: Community;

	// We don't want to close the modal after they've uploaded a header since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousHeaderId: number | null = null;

	created() {
		if (this.community.header) {
			this.previousHeaderId = this.community.header.id;
		}
	}

	onSubmit(community: Community) {
		const newHeaderId = (community.header && community.header.id) || null;
		if (this.previousHeaderId === newHeaderId) {
			this.modal.resolve(this.community);
		}
		this.previousHeaderId = newHeaderId;
	}
}
