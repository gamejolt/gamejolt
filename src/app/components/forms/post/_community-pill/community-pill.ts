import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../../../../../_common/community/verified-tick/verified-tick.vue';
import AppPillBi from '../../../../../_common/pill/bi/bi.vue';

@Component({
	components: {
		AppPillBi,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
	},
})
export default class AppFormPostCommunityPill extends Vue {
	@Prop(propRequired(Community))
	community!: Community;

	@Prop(propOptional(CommunityChannel))
	channel?: CommunityChannel;

	@Prop(propOptional(Boolean, true))
	removable!: boolean;

	@Emit('remove') emitRemove() {}
}
