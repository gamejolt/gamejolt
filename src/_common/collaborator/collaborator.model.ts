import { Community } from '../../components/community/community.model';
import { Api } from '../api/api.service';
import { Game } from '../game/game.model';
import { Model } from '../model/model.service';
import { User } from '../user/user.model';
import { Perm } from './collaboratable';

export type Roles =
	| 'owner'
	| 'collaborator'
	| 'community-manager'
	| 'developer'
	| 'dj'
	| 'moderator';

export class Collaborator extends Model {
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_INVITE = 'invite';

	static readonly ROLE_OWNER = 'owner';
	static readonly ROLE_EQUAL_COLLABORATOR = 'collaborator';
	static readonly ROLE_COMMUNITY_MANAGER = 'community-manager';
	static readonly ROLE_DEVELOPER = 'developer';
	static readonly ROLE_DJ = 'dj';
	static readonly ROLE_MODERATOR = 'moderator';

	resource!: 'Game' | 'Community';
	resource_id!: number;
	user_id!: number;
	status!: typeof Collaborator.STATUS_ACTIVE | typeof Collaborator.STATUS_INVITE;
	username?: string; // for submitting
	role!: Roles;
	perms: Perm[] = [];
	added_on!: number;
	accepted_on!: number;

	game?: Game;
	community?: Community;
	user?: User;

	constructor(data: any = {}) {
		super(data);

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

Model.create(Collaborator);
