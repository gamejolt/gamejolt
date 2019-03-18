import AppButton from 'game-jolt-frontend-lib/components/button/button.vue'
import AppProgressBar from 'game-jolt-frontend-lib/components/progress/bar/bar.vue'
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import { ClientUpdater } from '../../../_common/client/client-updater.service';

@Component({
	name: 'RouteUpgrade',
	components: {
		AppProgressBar,
		AppButton,
	},
})
export default class RouteUpgrade extends BaseRouteComponent {
	get status() {
		return ClientUpdater.clientUpdateStatus;
	}

	get progress() {
		// Lets avoid having two progress bars by combining download + extract progress reports.
		// 80% download, 20% extract seems like a nice mix.

		const progress = ClientUpdater.clientUpdateProgress;
		if (!progress) {
			return 0;
		}

		if (progress.type === 'download') {
			return Math.round(progress.percent * 0.8);
		}
		return 80 + Math.round(progress.percent * 0.2);
	}

	routeCreated() {
		ClientUpdater.checkForClientUpdates();
	}

	update() {
		ClientUpdater.updateClient();
	}
}
