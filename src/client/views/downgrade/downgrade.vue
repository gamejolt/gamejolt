<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import { getDeviceOS } from '../../../_common/device/device.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';

const ManifestUrl = 'https://d.gamejolt.net/data/client/manifest-2.json';

@Options({
	name: 'RouteDowngrade',
})
@OptionsForRoute({
	resolver: () => Api.sendRawRequest(ManifestUrl),
})
export default class RouteDowngrade extends BaseRouteComponent {
	downloadUrl = '';

	readonly platform = getDeviceOS();

	routeResolved(payload: any) {
		let platform = '';
		if (this.platform === 'windows') {
			platform = 'win32';
		} else if (this.platform === 'linux') {
			platform = 'linux64';
		} else if (this.platform === 'mac') {
			platform = 'osx64';
		}

		if (payload.data[platform] && payload.data[platform].url) {
			this.downloadUrl = payload.data[platform].url;
		}
	}
}
</script>

<template>
	<section class="section">
		<div class="container">
			<p class="lead">
				The Client database on your computer is initialized for an older version of the
				Client.
			</p>
			<p class="lead">
				<strong>
					To be able to use a new version of the Client, you must first install the old
					version so that it can migrate your data properly, and then reinstall the new
					version.
				</strong>
			</p>
			<p class="lead">This is required so that none of your information is lost!</p>
			<p v-if="downloadUrl" class="lead">
				<a :href="downloadUrl">
					<AppJolticon icon="download-box" />
					Download the old version of the Game Jolt Client.
				</a>
			</p>
		</div>
	</section>
</template>
