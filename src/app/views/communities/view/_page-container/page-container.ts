import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../../../utils/vue';
import { Screen } from '../../../../../_common/screen/screen-service';

@Options({})
export default class AppCommunitiesViewPageContainer extends Vue {
	@Prop(propOptional(Boolean, false))
	full!: boolean;

	readonly Screen = Screen;

	get sidebarHasContent() {
		return !!this.$slots.sidebar;
	}

	get shouldShowSidebar() {
		return Screen.isLg || (Screen.isMd && this.sidebarHasContent);
	}
}
