import { Options, Prop, Vue } from 'vue-property-decorator';
import { Screen } from '../../../../../_common/screen/screen-service';

@Options({})
export default class AppCommunitiesViewPageContainer extends Vue {
	@Prop({ type: Boolean, default: false })
	full!: boolean;

	readonly Screen = Screen;

	get sidebarHasContent() {
		// TODO(vue3): check
		return !!this.$slots.sidebar;
	}

	get shouldShowSidebar() {
		return Screen.isLg || (Screen.isMd && this.sidebarHasContent);
	}
}
