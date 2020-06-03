import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { FiresidePostCommunity } from '../../fireside/post/community/community.model';
import AppPillBi from '../../pill/bi/bi.vue';
import AppPill from '../../pill/pill.vue';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import AppCommunityThumbnailImg from '../thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../verified-tick/verified-tick.vue';

@Component({
	components: {
		AppPill,
		AppPillBi,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityPill extends Vue {
	@Prop(propRequired(FiresidePostCommunity))
	communityLink!: FiresidePostCommunity;

	@Prop(propOptional(Boolean, false))
	noLinks!: boolean;

	get community() {
		return this.communityLink.community;
	}

	get channel() {
		return this.communityLink.channel;
	}

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
