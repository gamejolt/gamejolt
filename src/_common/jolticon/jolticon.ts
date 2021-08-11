import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppJolticon extends Vue {
	@Prop(String) icon!: string;
	@Prop(Boolean) big?: boolean;
	@Prop(Boolean) highlight?: boolean;
	@Prop(Boolean) notice?: boolean;
}
