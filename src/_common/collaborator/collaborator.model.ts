import { Api } from '~common/api/api.service';
import { Perm } from '~common/collaborator/collaboratable';
import { CommunityModel } from '~common/community/community.model';
import { GameModel } from '~common/game/game.model';
import { Model } from '~common/model/model.service';
import { UserModel } from '~common/user/user.model';

export type Roles =
	| 'owner'
	| 'collaborator'
	| 'community-manager'
	| 'developer'
	| 'dj'
	| 'moderator'
	| 'jam-organizer';

export const CollaboratorStatusActive = 'active';
export const CollaboratorStatusInvite = 'invite';

export type CollaboratorStatus = typeof CollaboratorStatusActive | typeof CollaboratorStatusInvite;

export const CollaboratorRoleOwner = 'owner';
export const CollaboratorRoleEqualCollaborator = 'collaborator';
export const CollaboratorRoleCommunityManager = 'community-manager';
export const CollaboratorRoleDeveloper = 'developer';
export const CollaboratorRoleDJ = 'dj';
export const CollaboratorRoleModerator = 'moderator';
export const CollaboratorRoleJamOrganizer = 'jam-organizer';

export type CollaboratorRole =
	| typeof CollaboratorRoleOwner
	| typeof CollaboratorRoleEqualCollaborator
	| typeof CollaboratorRoleCommunityManager
	| typeof CollaboratorRoleDeveloper
	| typeof CollaboratorRoleDJ
	| typeof CollaboratorRoleModerator
	| typeof CollaboratorRoleJamOrganizer;

export class CollaboratorModel extends Model {
	declare resource: 'Game' | 'Community';
	declare resource_id: number;
	declare user_id: number;
	declare status: CollaboratorStatus;
	declare username?: string; // for submitting
	declare role: Roles;
	perms: Perm[] = [];
	declare added_on: number;
	declare accepted_on: number;
	declare game?: GameModel;
	declare community?: CommunityModel;
	declare user?: UserModel;

	constructor(data: any = {}) {
		super(data);

		// Object assign doesn't overwrite this because of its default value.
		this.perms = data.perms;

		if (data.resource_model) {
			if (this.resource === 'Game') {
				this.game = new GameModel(data.resource_model);
			} else if (this.resource === 'Community') {
				this.community = new CommunityModel(data.resource_model);
			}
		}

		if (data.user) {
			this.user = new UserModel(data.user);
		}
	}

	get isAccepted() {
		return !!this.accepted_on;
	}
}

export function $inviteCollaborator(model: CollaboratorModel) {
	let url = '';
	if (model.resource === 'Game') {
		url = '/web/dash/developer/games/collaborators/invite/' + model.resource_id;
	} else if (model.resource === 'Community') {
		url = '/web/dash/communities/collaborators/invite/' + model.resource_id;
	} else {
		throw new Error('Not supported');
	}

	return model.$_save(url, 'collaborator');
}

export function $acceptCollaboratorInvite(model: CollaboratorModel) {
	let url = '';
	if (model.resource === 'Game') {
		url = '/web/dash/developer/games/collaborators/accept/' + model.resource_id;
	} else if (model.resource === 'Community') {
		url = '/web/dash/communities/collaborators/accept/' + model.resource_id;
	} else {
		throw new Error('Not supported');
	}

	return model.$_save(url, 'collaborator');
}

export async function $removeCollaboratorInvite(model: CollaboratorModel) {
	let url = '';
	if (model.resource === 'Game') {
		url = '/web/dash/developer/games/collaborators/remove/' + model.resource_id;
	} else if (model.resource === 'Community') {
		url = '/web/dash/communities/collaborators/remove/' + model.resource_id;
	} else {
		throw new Error('Not supported');
	}

	const response = await Api.sendRequest(url, {
		user_id: model.user_id,
		role: model.role,
	});

	return model.processRemove(response);
}
