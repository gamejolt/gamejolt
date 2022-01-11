import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../../_common/community/thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../../../../../../_common/community/verified-tick/verified-tick.vue';
import AppPillBi from '../../../../../../_common/pill/bi/bi.vue';
import AppFormsCommunityPillSelector from '../selector/selector.vue';

@Options({
	components: {
		AppFormsCommunityPillSelector,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
		AppPillBi,
	},
})
export default class AppFormsCommunityPillIncomplete extends Vue {
	@Prop(propRequired(Array))
	communities!: Community[];

	@Prop(propRequired(Object))
	community!: Community;

	@Emit('add') emitAdd(_community: Community, _channel: CommunityChannel) {}
}
