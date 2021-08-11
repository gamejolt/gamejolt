import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppMeter extends Vue {
	@Prop(Number) rating!: number;
	@Prop(Boolean) big?: boolean;

	get level() {
		return (this.rating || 0) * 2;
	}
}
