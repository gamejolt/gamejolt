import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';

@Component({})
export default class AppFormPostChannels extends Vue {
	@Prop(CommunityChannel)
	value?: CommunityChannel;

	@Prop(Array)
	channels!: CommunityChannel[];

	@Emit('input')
	emitInput(_value: CommunityChannel) {}
}
