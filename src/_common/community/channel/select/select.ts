import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../channel.model';

@Component({})
export default class AppCommunityChannelSelect extends Vue {
	@Prop(CommunityChannel)
	value?: CommunityChannel;

	@Prop(Array)
	channels!: CommunityChannel[];

	@Emit('input')
	emitInput(_value: CommunityChannel) {}
}
