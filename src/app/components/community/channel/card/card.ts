import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';

@Component({})
export default class AppCommunityChannelCard extends Vue {
	@Prop(CommunityChannel)
	channel!: CommunityChannel;

	@Prop(Boolean)
	isActive!: boolean;

	@Prop(Boolean)
	isUnread!: boolean;

	get hasBackgroundImg() {
		return this.channel.background instanceof MediaItem;
	}

	get backgroundSrc() {
		return this.channel.background!.img_url;
	}
}
