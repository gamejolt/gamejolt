import { RouteLocationDefinition } from '../../utils/router';
import { Model } from '../model/model.service';

export const QuestNotificationAction = {
	available: 'quest-available',
	updated: 'quest-updated',
} as const;

export class QuestNotification extends Model {
	constructor(data: any = {}) {
		super(data);
	}

	declare action: string;
	declare title: string;
	declare subtitle: string;
	declare quest_id: number;
	declare is_new: boolean;
	declare has_activity: boolean;

	get routeLocation(): RouteLocationDefinition {
		return {
			name: 'quests.view',
			params: {
				id: this.quest_id,
			},
		};
	}
}

Model.create(QuestNotification);
