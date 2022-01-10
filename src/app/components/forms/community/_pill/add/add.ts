import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../../utils/vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppJolticon from '../../../../../../_common/jolticon/jolticon.vue';
import AppPill from '../../../../../../_common/pill/pill.vue';
import AppFormsCommunityPillSelector from '../selector/selector.vue';

@Options({
	components: {
		AppFormsCommunityPillSelector,
		AppPill,
		AppJolticon,
	},
})
export default class AppFormsCommunityPillAdd extends Vue {
	@Prop(propRequired(Array))
	communities!: Community[];

	@Prop(propOptional(Boolean, true))
	withChannel!: boolean;

	@Emit('add') emitAdd(_community: Community, _channel: CommunityChannel) {}
	@Emit('add-community') emitAddCommunity(_community: Community) {}
}
