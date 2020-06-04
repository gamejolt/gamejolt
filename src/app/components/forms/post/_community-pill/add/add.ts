import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import AppPillBi from '../../../../../../_common/pill/bi/bi.vue';
import AppFormPostCommunityPillSelector from '../selector/selector.vue';

@Component({
	components: {
		AppFormPostCommunityPillSelector,
		AppPillBi,
	},
})
export default class AppFormPostCommunityPillAdd extends Vue {
	@Prop(propRequired(Array))
	communities!: Community[];

	@Emit('add') emitAdd(_community: Community, _channel: CommunityChannel) {}
}
