import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppGrowlDynamic extends Vue {
	@Prop(Function) component!: typeof Vue;
	@Prop(Object) props?: any;

	render(h: CreateElement) {
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
