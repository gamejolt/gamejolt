import { ModelStoreModel, storeModel } from '../../../_common/model/model-store.service';
import { ReactionableModel, ReactionCount } from '../../../_common/reaction/reaction-count';
import { ChatUser } from './user';

import { Model } from '../../../_common/model/model.service';

//'../model/model.service';
export const TIMEOUT_CONSIDER_QUEUED = 1500; // Time in ms until a queued message should be displayed as such.

export type ChatMessageType = 'content' | 'sticker' | 'invite';

// TODO(realtime-reactions) See what comments is doing. this needs to implement ReactionableModel.
// See how reactions are displayed and interacted with (AppReactionList, ReactionCount, etc)
export class ChatMessage extends Model implements ModelStoreModel, ReactionableModel {
	declare id: number;
	declare user_id: number;
	declare user: ChatUser;
	declare room_id: number;
	declare content: string;
	declare logged_on: Date;
	declare edited_on: Date | null;
	declare type: ChatMessageType;

	declare showMeta?: boolean;
	declare showAvatar?: boolean;
	declare dateSplit?: boolean;
	declare is_automated?: boolean;
	declare reaction_counts: ReactionCount[];
	// TODO(realtime-reactions) Add reaction counts similar to how comment-model does it.

	// Used for rendering.
	_collapsable = false;
	_expanded = false;
	_isQueued = false;
	_showAsQueued = false; // Only after some time do we show a message as queued. Before that, we pretend like it went through.
	_isProcessing = false;
	_error = false; // When an error was received trying to send the message.

	get typename__() {
		return 'Message';
	}

	constructor(data: any) {
		super(data);
		this.update(data);
	}

	update(data: any) {
		Object.assign(this, data);

		if (typeof data.logged_on === 'number' || typeof data.logged_on === 'string') {
			this.logged_on = new Date(data.logged_on);
		}

		if (typeof data.edited_on === 'number' || typeof data.edited_on === 'string') {
			this.edited_on = new Date(data.edited_on);
		}

		if (data.user) {
			this.user = storeModel(ChatUser, data.user);
		}

		if (this.showMeta === undefined) {
			this.showMeta = false;
		}

		if (this.is_automated === undefined) {
			this.is_automated = false;
		}

		if (this.reaction_counts) {
			this.reaction_counts = ReactionCount.populate(data.reaction_counts);
		}
	}

	playNotificationSound() {
		/** Currently no sound is played when receiving a message. */
	}
}
