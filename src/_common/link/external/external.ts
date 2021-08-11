import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppLinkExternal extends Vue {
	@Prop(Boolean)
	targetSelf!: boolean;

	get target() {
		if (this.targetSelf) {
			return '_self';
		}
		return '_blank';
	}
}
