export const COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING = 'posting';

export class CommunityChannelPermissions {
	allPermissions = false;
	noPermissions = false;

	perms?: Record<string, boolean>;

	constructor(input: any) {
		if (!input) {
			this.noPermissions = true;
		} else if (input === true) {
			this.allPermissions = true;
		} else {
			this.perms = input;
		}
	}

	public canPerform(action: string) {
		if (this.noPermissions) {
			return false;
		} else if (this.allPermissions) {
			return true;
		} else if (this.perms?.[action] === true) {
			return true;
		}
		return false;
	}
}
