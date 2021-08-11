import { Options, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Community } from '../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import { CommunitySidebarData } from '../sidebar-data';
import AppCommunitySidebar from '../sidebar.vue';

@Options({
	components: {
		AppCommunitySidebar,
	},
})
export default class AppCommunitySidebarModal extends BaseModal {
	@Prop(propRequired(Boolean)) isEditing!: boolean;
	@Prop(propRequired(CommunitySidebarData)) data!: CommunitySidebarData;
	@Prop(propRequired(Community)) community!: Community;
}
