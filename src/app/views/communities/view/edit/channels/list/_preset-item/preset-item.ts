import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { assertNever } from '../../../../../../../../utils/utils';
import { propRequired } from '../../../../../../../../utils/vue';
import AppCardListItem from '../../../../../../../../_common/card/list/item/item.vue';
import {
	Community,
	CommunityPresetChannelType,
	getCommunityChannelBackground,
} from '../../../../../../../../_common/community/community.model';
import AppCommunityChannelCardEdit from '../../../../../../../components/community/channel/card/edit/edit.vue';
import { CommunityChannelPresetBackgroundModal } from '../../../../../../../components/community/channel/preset-background-modal/preset-background-modal.service';

@Component({
	components: {
		AppCardListItem,
		AppCommunityChannelCardEdit,
	},
})
export default class AppCommunitiesEditChannelListPresetItem extends Vue {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propRequired(String)) presetType!: CommunityPresetChannelType;

	@Emit('edit') emitEdit() {}

	get elementId() {
		return `channel-container-${this.presetType}`;
	}

	get label() {
		switch (this.presetType) {
			case CommunityPresetChannelType.ALL:
				return this.$gettext(`All Posts`);
			case CommunityPresetChannelType.FEATURED:
				return this.$gettext(`Frontpage`);
		}

		assertNever(this.presetType);
	}

	get background() {
		return getCommunityChannelBackground(this.community, this.presetType);
	}

	async onClickEditBackground() {
		await CommunityChannelPresetBackgroundModal.show(this.community, this.presetType);
		this.emitEdit();
	}
}
