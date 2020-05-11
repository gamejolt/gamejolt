import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import AppCardListItem from '../../../../../_common/card/list/item/item.vue';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../_common/community/community.model';
import FormCommunityChannelEditPreset from '../../../forms/community/channel/edit/preset.vue';

@Component({
	components: {
		AppCardListItem,
		FormCommunityChannelEditPreset,
	},
})
export default class AppCommunityChannelPresetListItem extends Vue {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propRequired(String)) presetType!: CommunityPresetChannelType;

	get elementId() {
		return `channel-container-${this.presetType}`;
	}

	get background() {
		switch (this.presetType) {
			case CommunityPresetChannelType.ALL:
				return this.community.all_background;
			case CommunityPresetChannelType.FEATURED:
				return this.community.featured_background;
		}

		throw new Error('Preset type not defined!');
	}

	get label() {
		switch (this.presetType) {
			case CommunityPresetChannelType.ALL:
				return this.$gettext(`All Posts`);
			case CommunityPresetChannelType.FEATURED:
				return this.$gettext(`Featured`);
		}

		throw new Error('Preset type not defined!');
	}

	@Emit('edit')
	emitEdited() {}
}
