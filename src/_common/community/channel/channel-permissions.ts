export class ChannelPermissions {
	public static readonly ACTION_POSTING = 'posting';

	allPermissions = false;
	noPermissions = false;

	perms?: { [key: string]: boolean };

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
		} else if (this.perms && this.perms[action] === true) {
			return true;
		}
		return false;
	}
}
