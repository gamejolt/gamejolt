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
		switch (this.$route.name) {
			case 'communities.view.overview.edit.details':
				return this.$gettext('Details');
			case 'communities.view.overview.edit.channels':
				return this.$gettext('Channels');
			case 'communities.view.overview.edit.games':
				return this.$gettext('Games');
			case 'communities.view.overview.edit.moderators':
				return this.$gettext('Moderators');
			case 'communities.view.overview.edit.blocks':
				return this.$gettext('Blocks');
		}
		return '<Invalid Item>';
	}
}
