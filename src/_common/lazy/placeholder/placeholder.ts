import { h } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export class AppLazyPlaceholder extends Vue {
	@Prop() when!: any;
	@Prop({ type: String, default: 'div' })
	tag!: string;

	render() {
		return h(
			this.tag,
			{
				class: {
					'lazy-placeholder-resolving': !this.when,
					'lazy-placeholder-resolved': !!this.when,
				},
			},
			this.$slots.default?.()
		);
	}
}
