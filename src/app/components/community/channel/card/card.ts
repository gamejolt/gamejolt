import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityChannelCard extends Vue {
	@Prop(MediaItem)
	backgroundItem?: MediaItem;

	@Prop(String)
	title!: string;

	@Prop(Boolean)
	isActive!: boolean;

	@Prop(Boolean)
	isUnread!: boolean;

	get linkTo() {
		const link = { name: 'communities.view.overview' } as any;
		if (this.title === 'featured') {
			return link;
		}

		link.params = { channel: this.title };
		return link;
	}
}
