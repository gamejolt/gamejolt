import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppPopper from '../../popper/popper.vue';

@Options({
	components: {
		AppPopper,
	},
})
export default class AppListGroupSelector extends Vue {
	@Prop() current?: any;
	@Prop({ type: Array, default: () => [] }) items!: any[];

	@Emit('change')
	emitChange(_item: any) {}

	select(item: any) {
		this.emitChange(item);
	}
}
