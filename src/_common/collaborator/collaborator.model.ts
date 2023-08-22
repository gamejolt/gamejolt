import { Api } from '../api/api.service';
import { Community } from '../community/community.model';
import { Game } from '../game/game.model';
import { Model, defineLegacyModel } from '../model/model.service';
import { User } from '../user/user.model';
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

export class Collaborator extends defineLegacyModel(
	class CollaboratorDefinition extends Model {
		declare resource: 'Game' | 'Community';
		declare resource_id: number;
		declare user_id: number;
		declare status: CollaboratorStatus;
		declare username?: string; // for submitting
		declare role: Roles;
		perms: Perm[] = [];
		declare added_on: number;
		declare accepted_on: number;
		declare game?: Game;
		declare community?: Community;
		declare user?: User;

		constructor(data: any = {}) {
			super(data);

			// Object assign doesn't overwrite this because of its default value.
			this.perms = data.perms;

			if (data.resource_model) {
				if (this.resource === 'Game') {
					this.game = new Game(data.resource_model);
				} else if (this.resource === 'Community') {
					this.community = new Community(data.resource_model);
				}
			}

			if (data.user) {
				this.user = new User(data.user);
			}
		}

		get isAccepted() {
			return !!this.accepted_on;
		}

		$invite() {
			let url = '';
			if (this.resource === 'Game') {
				url = '/web/dash/developer/games/collaborators/invite/' + this.resource_id;
			} else if (this.resource === 'Community') {
				url = '/web/dash/communities/collaborators/invite/' + this.resource_id;
			} else {
				throw new Error('Not supported');
			}

			return this.$_save(url, 'collaborator');
		}

		$accept() {
			let url = '';
			if (this.resource === 'Game') {
				url = '/web/dash/developer/games/collaborators/accept/' + this.resource_id;
			} else if (this.resource === 'Community') {
				url = '/web/dash/communities/collaborators/accept/' + this.resource_id;
			} else {
				throw new Error('Not supported');
			}

			return this.$_save(url, 'collaborator');
		}

		async $remove() {
			let url = '';
			if (this.resource === 'Game') {
				url = '/web/dash/developer/games/collaborators/remove/' + this.resource_id;
			} else if (this.resource === 'Community') {
				url = '/web/dash/communities/collaborators/remove/' + this.resource_id;
			} else {
				throw new Error('Not supported');
			}

			const response = await Api.sendRequest(url, {
				user_id: this.user_id,
				role: this.role,
			});

			return this.processRemove(response);
		}
	}
) {}
