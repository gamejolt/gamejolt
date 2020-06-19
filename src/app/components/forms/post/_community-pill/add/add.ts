import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppJolticon from '../../../../../../_common/jolticon/jolticon.vue';
import AppPill from '../../../../../../_common/pill/pill.vue';
import AppFormPostCommunityPillSelector from '../selector/selector.vue';

@Component({
	components: {
		AppFormPostCommunityPillSelector,
		AppPill,
		AppJolticon,
	},
})
export default class AppFormPostCommunityPillAdd extends Vue {
	@Prop(propRequired(Array))
	communities!: Community[];

	@Emit('add') emitAdd(_community: Community, _channel: CommunityChannel) {}
}
