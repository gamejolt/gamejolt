import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./notification.html';

import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Notification } from '../../../../../lib/gj-lib-client/components/notification/notification-model';
import { ActivityFeedItem } from '../item-service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppFadeCollapse } from '../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { AppNotificationDescriptiveAction } from '../../../notification/descriptive-action/descriptive-action';

@View
@Component({
	components: {
		AppJolticon,
		AppTimeAgo,
		AppFadeCollapse,
		AppNotificationDescriptiveAction,
	},
})
export class AppActivityFeedNotification extends Vue
{
	@Prop( ActivityFeedItem ) item: ActivityFeedItem;

	notification: Notification;

	canToggleContent = false;
	showFullContent = false;

	Screen = makeObservableService( Screen );

	get icon()
	{
		return this.notification.jolticon.replace( 'jolticon-', '' );
	}

	get hasDetails()
	{
		return [
			Notification.TYPE_COMMENT_ADD,
			Notification.TYPE_COMMENT_ADD_OBJECT_OWNER,
			Notification.TYPE_GAME_RATING_ADD,
		].indexOf( this.notification.type ) !== -1;
	}

	created()
	{
		this.notification = this.item.feedItem as Notification;
	}

	go()
	{
		this.notification.go( this.$router );
		this.$emit( 'clicked' );
	}

	toggleFull()
	{
		this.showFullContent = !this.showFullContent;
	}
}
