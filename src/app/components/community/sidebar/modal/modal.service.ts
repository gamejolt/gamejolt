import { asyncComponentLoader } from '../../../../../utils/utils';
import { Community } from '../../../../../_common/community/community.model';
import { Modal } from '../../../../../_common/modal/modal.service';
import { User } from '../../../../../_common/user/user.model';

interface CommunitySidebarModalOptions {
	community: Community;
	isEditing: boolean;
	owner: User | null;
	knownMembers: User[];
	knownMemberCount: number;
	collaborators: User[];
	collaboratorCount: number;
	initialCollaboratorCount: number;
}

export class CommunitySidebarModal {
	static async show(options: CommunitySidebarModalOptions) {
		const {
			community,
			isEditing,
			owner,
			knownMembers,
			knownMemberCount,
			collaborators,
			collaboratorCount,
			initialCollaboratorCount,
		} = options;

		return await Modal.show<void>({
			modalId: 'CommunitySidebarModal-' + community.id,
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunitySidebarModal" */ './modal.vue')
				),
			props: {
				community,
				isEditing,
				owner,
				knownMembers,
				knownMemberCount,
				collaborators,
				collaboratorCount,
				initialCollaboratorCount,
			},
			size: 'sm',
		});
	}
}
