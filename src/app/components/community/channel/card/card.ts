import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../_common/community/community.model';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Component({
	components: {
		AppMediaItemBackdrop,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityChannelCard extends Vue {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propRequired(String)) path!: string;
	@Prop(propRequired(String)) label!: string;
	@Prop(propOptional(MediaItem)) backgroundItem?: MediaItem;
	@Prop(propOptional(Boolean, false)) isActive!: boolean;
	@Prop(propOptional(Boolean, false)) isUnread!: boolean;
	@Prop(propOptional(String)) sort!: string;
	@Prop(propOptional(Boolean, false)) isLocked!: boolean;

	get linkTo() {
		if (this.path === CommunityPresetChannelType.FEATURED) {
			return { name: 'communities.view.overview' };
		}

		const link = {
			name: 'communities.view.channel',
			params: { path: this.community.path, channel: this.path },
		} as any;

		if (this.sort) {
			link.query = { sort: this.sort };
		}

		return link;
	}
}
