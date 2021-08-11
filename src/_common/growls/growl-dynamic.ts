import { h } from 'vue';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export class AppGrowlDynamic extends Vue {
	@Prop(Function) component!: typeof Vue;
	@Prop(Object) props?: any;

	@Emit('close')
	emitClose() {}

	render() {
		return h(this.component, {
			props: this.props,
			on: {
				close: () => {
					this.emitClose();
				},
			},
		});
	}
}
