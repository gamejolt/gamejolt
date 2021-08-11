import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppProgressBar extends Vue {
	@Prop(Number)
	percent!: number;

	@Prop(Boolean)
	thin?: boolean;

	@Prop(Boolean)
	active?: boolean;

	@Prop(Boolean)
	indeterminate?: boolean;

	@Prop({ type: Boolean, default: true })
	animate!: boolean;
}
