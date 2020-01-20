import { User } from '../../../../_common/user/user.model';

export class CommunitySidebarData {
	owner: User;

	knownMembers: User[];
	knownMemberCount: number;

	collaborators: User[];
	collaboratorCount: number;
	initialCollaboratorCount: number;

	constructor($payload: any) {
		this.knownMembers = User.populate($payload.knownMembers || []);
		this.knownMemberCount = $payload.knownMemberCount || 0;

		if (!$payload.owner) {
			throw new Error('No owner returned in payload.');
		}
		this.owner = new User($payload.owner);

		if (!$payload.collaborators) {
			throw new Error('No collaborator list returned in payload.');
		}
		this.collaborators = User.populate($payload.collaborators);
		this.collaboratorCount = $payload.collaboratorCount;
		this.initialCollaboratorCount = $payload.initialCollaboratorCount;
	}
}
