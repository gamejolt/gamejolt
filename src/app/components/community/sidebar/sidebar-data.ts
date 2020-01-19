import { Community } from '../../../../_common/community/community.model';
import { User } from '../../../../_common/user/user.model';

export class CommunitySidebarData {
	community!: Community;
	owner!: User;

	knownMembers!: User[];
	knownMemberCount!: number;

	collaborators!: User[];
	collaboratorCount!: number;
	initialCollaboratorCount!: number;

	constructor(community: Community, $payload: any = undefined) {
		this.community = community;

		if ($payload) {
			this.knownMembers = User.populate($payload.knownMembers || []);
			this.knownMemberCount = $payload.knownMemberCount || 0;

			if ($payload.owner) {
				this.owner = new User($payload.owner);
			}
			if ($payload.collaborators) {
				this.collaborators = User.populate($payload.collaborators);
			}
			this.collaboratorCount = $payload.collaboratorCount;
			this.initialCollaboratorCount = $payload.initialCollaboratorCount;
		}
	}
}
