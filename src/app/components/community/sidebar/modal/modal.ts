import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import { User } from '../../../../../_common/user/user.model';
import AppCommunitySidebar from '../sidebar.vue';

@Component({
	components: {
		AppCommunitySidebar,
	},
})
export default class AppCommunitySidebarModal extends BaseModal {
	@Prop(Community)
	community!: Community;

	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(User)
	owner!: User;

	@Prop(Array)
	knownMembers!: User[];

	@Prop(Number)
	knownMemberCount!: number;

	@Prop(Array)
	collaborators!: User[];

	@Prop(Number)
	collaboratorCount!: number;

	@Prop(Number)
	initialCollaboratorCount!: number;
}
