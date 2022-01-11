import { mixins, Options, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import {
	Community,
	CommunityPresetChannelType,
	getCommunityChannelBackground,
} from '../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import FormCommunityChannelPresetBackground from '../../../forms/community/channel/preset-background/preset-background.vue';

@Options({
	components: {
		FormCommunityChannelPresetBackground,
	},
})
export default class AppCommunityChannelPresetBackgroundModal extends mixins(BaseModal) {
	@Prop(propRequired(Object)) community!: Community;
	@Prop(propRequired(String)) presetType!: CommunityPresetChannelType;

	previousBackgroundId: number | null = null;

	created() {
		const background = getCommunityChannelBackground(this.community, this.presetType);
		if (background) {
			this.previousBackgroundId = background.id;
		}
	}

	onSubmit(community: Community) {
		const background = getCommunityChannelBackground(community, this.presetType);
		const newBackgroundId = (background && background.id) || null;

		console.log('previous', this.previousBackgroundId, 'new', newBackgroundId);

		if (this.previousBackgroundId === newBackgroundId) {
			this.modal.resolve(this.community);
		}
		this.previousBackgroundId = newBackgroundId;
	}
}
