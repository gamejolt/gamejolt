import { Model } from '../model/model.service';

export const QuestNotificationAction = {
	available: 'quest-available',
	updated: 'quest-updated',
} as const;

export class QuestNotificationModel extends Model {
	declare action: string;
	declare title: string;
	declare subtitle: string;
	declare quest_id: number;
	declare is_new: boolean;
	declare has_activity: boolean;

	constructor(data: any = {}) {
		super(data);
	}
}
