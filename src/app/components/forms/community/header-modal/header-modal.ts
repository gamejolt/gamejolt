import View from '!view!./header-modal.html';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { Component, Prop } from 'vue-property-decorator';
import { FormCommunityHeader } from '../header/header';

@View
@Component({
	components: {
		FormCommunityHeader,
	},
})
export default class AppCommunityHeaderEditModal extends BaseModal {
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
