import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Screen } from '../../../../../_common/screen/screen-service';

@Component({})
export default class AppCommunitiesViewPageContainer extends Vue {
	readonly Screen = Screen;

	get sidebarHasContent() {
		return this.$slots.sidebar;
	}
}
