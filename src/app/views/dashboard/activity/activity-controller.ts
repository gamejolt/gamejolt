import { Injectable } from 'ng-metadata/core';

@Injectable()
export class ActivityCtrl
{
	activityUnreadCount: number;
	notificationsUnreadCount: number;

	constructor()
	{
	}
}
