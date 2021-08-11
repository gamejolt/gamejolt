import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppButtonPlaceholder extends Vue {
	@Prop(Boolean)
	sparse?: boolean;
	@Prop(Boolean)
	circle?: boolean;
	@Prop(Boolean)
	block?: boolean;
}
