import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import AppPillBi from '../../pill/bi/bi.vue';
import AppPill from '../../pill/pill.vue';
import { CommunityChannel } from '../channel/channel.model';
import { Community } from '../community.model';
import AppCommunityThumbnailImg from '../thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

@Component({
	components: {
		AppPill,
		AppPillBi,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
	},
})
export default class AppCommunityPill extends Vue {
	@Prop(propRequired(Community))
	community!: Community;

	@Prop(propOptional(CommunityChannel))
	channel?: CommunityChannel;

	@Prop(propOptional(Boolean, false))
	noLinks!: boolean;

	get toCommunity() {
		if (this.noLinks) {
			return undefined;
		}
		return this.community.routeLocation;
	}

	get toChannel() {
		if (this.noLinks || !this.channel) {
			return undefined;
		}
		return this.community.channelRouteLocation(this.channel);
	}
}
