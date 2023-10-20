import { UserModel } from '../../../../_common/user/user.model';

export class CommunitySidebarData {
	owner: UserModel;

	knownMembers: UserModel[];
	knownMemberCount: number;

	collaborators: UserModel[];
	collaboratorCount: number;
	initialCollaboratorCount: number;

	constructor($payload: any) {
		this.knownMembers = UserModel.populate($payload.knownMembers || []);
		this.knownMemberCount = $payload.knownMemberCount || 0;

		if (!$payload.owner) {
			throw new Error('No owner returned in payload.');
		}
		this.owner = new UserModel($payload.owner);

		if (!$payload.collaborators) {
			throw new Error('No collaborator list returned in payload.');
		}
		this.collaborators = UserModel.populate($payload.collaborators);
		this.collaboratorCount = $payload.collaboratorCount;
		this.initialCollaboratorCount = $payload.initialCollaboratorCount;
	}
}
