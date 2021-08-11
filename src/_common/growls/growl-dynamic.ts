import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export class AppGrowlDynamic extends Vue {
	@Prop(Function) component!: typeof Vue;
	@Prop(Object) props?: any;

	render() {
		return h(this.component, {
			props: this.props,
			on: {
				close: () => {
					this.$emit('close');
				},
			},
		});
	}
}
