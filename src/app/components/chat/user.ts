import { AvatarFrameModel } from '../../../_common/avatar/frame.model';
import { Jolticon } from '../../../_common/jolticon/AppJolticon.vue';
import { ModelStoreModel } from '../../../_common/model/model-store.service';
import { $gettext } from '../../../_common/translate/translate.service';
import { UserCommonFields } from '../../../_common/user/user.model';
import { objectOmit } from '../../../utils/object';
import { tryGetRoomRole } from './client';
import { ChatMessageModel } from './message';
import { CHAT_ROLES } from './role';
import { ChatRoomModel } from './room';

export class ChatUser implements UserCommonFields, ModelStoreModel {
	declare id: number;
	declare room_id: number;
	declare last_message_on: number;
	declare username: string;
	declare display_name: string;
	declare img_avatar: string;
	declare permission_level: number;
	declare is_verified: boolean;
	declare is_creator?: boolean;

	declare avatar_frame?: AvatarFrameModel;

	isOnline = false;
	role: CHAT_ROLES | null = null;

	constructor(data: any = {}) {
		this.update(data);
	}

	// Since the chat user is just a wrapper for user, the chat user ID will be
	// the same across many rooms, even though we store different data. In order
	// to separate these models in the model store, we want to take into account
	// the room ID as well.
	modelStoreId() {
		return `${this.id}/${this.room_id}`;
	}

	update(data: any) {
		// Exclude our `url` getter when assigning.
		Object.assign(this, objectOmit(data, ['url']));

		if (data.avatar_frame) {
			this.avatar_frame = new AvatarFrameModel(data.avatar_frame);
		}
	}

	get url() {
		return `/@${this.username}`;
	}

	get isStaff() {
		return this.permission_level > 0;
	}
}

interface ChatRoleData {
	icon: Jolticon;
	tooltip: string;
}

export function getChatUserRoleData(
	room: ChatRoomModel,
	user: ChatUser,
	extras: {
		/**
		 * Can be provided to display a robot Jolticon for automated chat
		 * messages.
		 */
		mesage?: ChatMessageModel;
	} = {}
): ChatRoleData | undefined {
	if (extras.mesage?.is_automated) {
		return {
			icon: 'robot',
			tooltip: $gettext(`Automated Message`),
		};
	}

	const role = tryGetRoomRole(room, user);

	if (role === 'owner') {
		return {
			icon: 'crown',
			tooltip: $gettext(`Room Owner`),
		};
	}

	// In public rooms, display staff member status.
	if (!room.isPrivateRoom && user.isStaff) {
		return {
			icon: 'gamejolt',
			tooltip: $gettext(`Game Jolt Staff`),
		};
	}

	if (role === 'moderator') {
		return {
			icon: 'star',
			tooltip: $gettext(`Chat Moderator`),
		};
	}
}
