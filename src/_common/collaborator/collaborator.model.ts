import { Api } from '../api/api.service';
import { CommunityModel } from '../community/community.model';
import { GameModel } from '../game/game.model';
import { Model } from '../model/model.service';
import { UserModel } from '../user/user.model';
import { Perm } from './collaboratable';

export type Roles =
	| 'owner'
	| 'collaborator'
	| 'community-manager'
	| 'developer'
	| 'dj'
	| 'moderator'
	| 'jam-organizer';

export const enum CollaboratorStatus {
	Active = 'active',
	Invite = 'invite',
}

export const enum CollaboratorRole {
	Owner = 'owner',
	EqualCollaborator = 'collaborator',
	CommunityManager = 'community-manager',
	Developer = 'developer',
	DJ = 'dj',
	Moderator = 'moderator',
	JamOrganizer = 'jam-organizer',
}

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
