import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../../_common/modal/base';
import AppCommunityCompetitionSidebar from '../sidebar.vue';

@Component({
	components: {
		AppCommunityCompetitionSidebar,
	},
})
export default class AppCommunityCompetitionSidebarModal extends BaseModal {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propRequired(CommunityChannel)) channel!: CommunityChannel;
}
