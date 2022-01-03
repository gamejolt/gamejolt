import { Options, Prop, Vue } from 'vue-property-decorator';

const images = import.meta.globEager('./*.gif');

@Options({})
export default class AppLoading extends Vue {
	@Prop({ type: String, default: 'Loading...' })
	label!: string;
	@Prop(Boolean) hideLabel!: boolean;
	@Prop(Boolean) big!: boolean;
	@Prop(Boolean) noColor!: boolean;
	@Prop(Boolean) stationary!: boolean;
	@Prop(Boolean) centered!: boolean;

	get img() {
		const img =
			'loading' +
			(this.stationary ? '-stationary' : '') +
			(this.noColor ? '-bw' : '') +
			(this.big ? '-2x' : '');

		return images[`./${img}.gif`].default;
	}
}
