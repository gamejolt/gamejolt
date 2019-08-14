import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import './placeholder.styl';

@Component({})
export class AppLazyPlaceholder extends Vue {
	@Prop() when!: any;
	@Prop({ type: String, default: 'div' })
	tag!: string;

	render(h: CreateElement) {
		return h(
			this.tag,
			{
				class: {
					'lazy-placeholder-resolving': !this.when,
					'lazy-placeholder-resolved': !!this.when,
				},
			},
			this.$slots.default
		);
	}
}
