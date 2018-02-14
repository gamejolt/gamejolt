import Vue, { CreateElement } from 'vue';
import { Mutation } from 'vuex-class';
import { Component } from 'vue-property-decorator';

import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import { Store } from '../../../store/index';

// wait 3 seconds before submitting call, hopefully all other critical components have loaded by then :S
const InitialLag = 3000;

@Component({})
export class AppShellNotificationCount extends Vue {
	@Mutation incrementNotificationCount: Store['incrementNotificationCount'];

	created() {
		setTimeout(() => this.fetchCount(), InitialLag);
	}

	private async fetchCount() {
		try {
			const response = await Notification.fetchNotificationsCount();
			this.incrementNotificationCount(response.notificationsCount);
		} catch (e) {}
	}

	render(h: CreateElement) {
		return h('div', { staticClass: 'hidden' });
	}
}
