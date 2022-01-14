<script lang="ts">
import { Options } from 'vue-property-decorator';
import { ClientUpdater } from '../../../_common/client/client-updater.service';
import AppProgressBar from '../../../_common/progress/bar/bar.vue';
import { BaseRouteComponent } from '../../../_common/route/route-component';

@Options({
	name: 'RouteUpgrade',
	components: {
		AppProgressBar,
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
</script>

<template>
	<section class="section">
		<div class="container">
			<h1>
				Updating the Client
				<small>(it's about time)</small>
			</h1>

			<p class="lead">This version is outdated.</p>

			<p>We've added some epic new features the current client is incompatible with.</p>
			<p>Instead of staring at our lovely error messages, let's get your client up to speed!</p>

			<br />

			<template v-if="status === 'error'">
				<div class="alert alert-notice">
					<p><strong>Oh no, the client failed to update</strong></p>
					<p>
						Try restarting it. If it still doesn't work,
						<a href="https://gamejolt.com/client">reinstall it from the website</a>
						.
					</p>
				</div>
			</template>

			<template v-else-if="status !== 'ready'">
				<p class="lead">
					<strong>
						<template v-if="status === 'fetching'">
							Downloading new version ...
						</template>
						<template v-else>
							Checking for updates ...
						</template>
					</strong>
				</p>

				<app-progress-bar active :percent="progress" />
			</template>

			<app-button v-else lg @click="update()">
				Update now
			</app-button>
		</div>
	</section>
</template>
