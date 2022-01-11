import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../../../../../_common/community/verified-tick/verified-tick.vue';
import AppPillBi from '../../../../../_common/pill/bi/bi.vue';
import AppPill from '../../../../../_common/pill/pill.vue';

@Options({
	components: {
		AppPill,
		AppPillBi,
		AppCommunityThumbnailImg,
		AppCommunityVerifiedTick,
	},
})
export default class AppFormsCommunityPill extends Vue {
	@Prop(propRequired(Object))
	community!: Community;

	@Prop(propOptional(Object))
	channel?: CommunityChannel;

	@Prop(propOptional(Boolean, true))
	removable!: boolean;

	@Prop(propOptional(Boolean, true))
	withChannel!: boolean;

	@Emit('remove') emitRemove() {}
}
