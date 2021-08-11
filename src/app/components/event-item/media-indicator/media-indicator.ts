import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppEventItemMediaIndicator extends Vue {
	@Prop(Number)
	count!: number;

	@Prop(Number)
	current!: number;
}
