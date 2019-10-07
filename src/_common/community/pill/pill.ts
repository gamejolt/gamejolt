import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppPill from '../../pill/pill.vue';
import { CommunityChannel } from '../channel/channel.model';
import { Community } from '../community.model';
import AppCommunityThumbnailImg from '../thumbnail/img/img.vue';

@Component({
	components: {
		AppPill,
		AppCommunityThumbnailImg,
	},
})
export default class AppCommunityPill extends Vue {
	@Prop(Community)
	community!: Community;

	@Prop(CommunityChannel)
	channel?: CommunityChannel;

	@Prop(Boolean)
	static?: boolean;

	get toCommunity() {
		return this.static ? undefined : this.community.routeLocation;
	}

	get toChannel() {
		return this.static || !this.channel
			? undefined
			: this.community.channelRouteLocation(this.channel);
	}

	get leftColor() {
		return 'lime';
	}

	get rightColor() {
		return 'yellow';
	}
}
