import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Community } from '../../../../../../../_common/community/community.model';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import { AppCommunityPerms } from '../../../../../../components/community/perms/perms';

@Component({
	components: {
		AppCommunityPerms,
	},
})
export default class AppCommunitiesViewOverviewNavEdit extends Vue {
	@Prop(Community)
	community!: Community;

	isNavExpanded = false;

	readonly Screen = Screen;

	get activeItem() {
		return 'Overview';
	}
}
