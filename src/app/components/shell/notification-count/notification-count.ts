import Vue from 'vue';
import { Mutation } from 'vuex-class';
import { Component } from 'vue-property-decorator';

import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import { Store } from '../../../store/index';

const CountInterval = 5 * 60 * 1000; // 5 minutes.
const InitialLag = 3000;

@Component({})
export class AppShellNotificationCount extends Vue {
	private interval: NodeJS.Timer;

	@Mutation setNotificationCount: Store['setNotificationCount'];

	created() {
		setTimeout(() => this.fetchCount(), InitialLag);
		this.interval = setInterval(() => this.fetchCount(), CountInterval);

		// TODO
		// Can emit this to refresh the notification counts when they've changed.
		// $scope.$on( 'NotificationCount.refresh', () => this.fetchCount() );
	}

	destroyed() {
		clearInterval(this.interval);
	}

	private async fetchCount() {
		try {
			const response = await Notification.fetchNotificationsCount();
			this.setNotificationCount(response.notificationsCount);
		} catch (e) {}
	}

	render(h: Vue.CreateElement) {
		return h('div', { staticClass: 'hidden' });
	}
}
