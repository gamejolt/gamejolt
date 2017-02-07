import { Injectable } from 'ng-metadata/core';

@Injectable( 'ActivityCtrl' )
export class ActivityCtrl
{
	activityUnreadCount: number;
	notificationsUnreadCount: number;

	constructor()
	{
	}
}
