import { FiresideRTCHost } from '../../../_common/fireside/rtc/rtc';
import { CHAT_ROLES } from './role';

export class ChatUser {
	id!: number;
	room_id!: number;
	last_message_on!: number;
	username!: string;
	display_name!: string;
	img_avatar!: string;
	permission_level!: number;
	is_verified!: boolean;

	isOnline = false;
	typing = false;

	role: CHAT_ROLES | null = null;

	firesideHost: FiresideRTCHost | null = null;

	constructor(data: any = {}) {
		Object.assign(this, data);
	}

	get url() {
		return `/@${this.username}`;
	}

	get isStaff() {
		return this.permission_level > 0;
	}

	get isLive() {
		if (!this.firesideHost || this.firesideHost.needsPermissionToView) {
			return false;
		}
		return this.firesideHost.isLive;
	}
}
