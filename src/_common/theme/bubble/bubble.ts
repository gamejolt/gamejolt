import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppThemeBubble extends Vue {
	@Prop(String)
	highlight!: string;

	@Prop(String)
	backlight?: string;

	@Prop(Boolean)
	active?: boolean;
}
