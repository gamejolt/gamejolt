import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { Community } from '../../../../../_common/community/community.model';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';

@Component({
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
		const link = { name: 'communities.view.overview' } as any;
		if (this.path === 'featured') {
			return link;
		}

		link.params = { path: this.community.path, channel: this.path };
		if (this.sort) {
			link.query = { sort: this.sort };
		}

		return link;
	}
}
