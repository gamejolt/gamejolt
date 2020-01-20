import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import { CommunitySidebarData } from '../sidebar-data';
import AppCommunitySidebar from '../sidebar.vue';

@Component({
	components: {
		AppCommunitySidebar,
	},
})
export default class AppCommunitySidebarModal extends BaseModal {
	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(CommunitySidebarData)
	data!: CommunitySidebarData;

	@Prop(Community)
	community!: Community;
}
