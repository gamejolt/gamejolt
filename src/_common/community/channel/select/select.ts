import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import AppPill from '../../../pill/pill.vue';
import { CommunityChannel } from '../channel.model';

@Component({
	components: {
		AppPill,
	},
})
export default class AppCommunityChannelSelect extends Vue {
	@Prop(CommunityChannel)
	value?: CommunityChannel;

	@Prop(Array)
	channels!: CommunityChannel[];

	@Emit('input')
	emitInput(_value: CommunityChannel) {}

	get validChannels() {
		return this.channels.filter(i => i.canPost);
	}
}
