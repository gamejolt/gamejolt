import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppPill from '../../../pill/pill.vue';
import { CommunityChannel } from '../channel.model';

@Options({
	components: {
		AppPill,
	},
})
export default class AppCommunityChannelSelect extends Vue {
	@Prop(CommunityChannel)
	modelValue?: CommunityChannel;

	@Prop(Array)
	channels!: CommunityChannel[];

	@Emit('update:modelValue')
	emitUpdate(_modelValue: CommunityChannel) {}

	get validChannels() {
		return this.channels.filter(i => i.canPost);
	}
}
