<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { getDeviceOS } from '../../device/device.service';
import { AppClientMacAppMenu } from '../mac-app-menu/mac-app-menu';
import AppClientTray from '../tray/AppClientTray.vue';

@Options({
	components: {
		AppClientTray,
		AppClientMacAppMenu,
	},
})
export default class AppClientBase extends Vue {
	get os() {
		return getDeviceOS();
	}
}
</script>

<template>
	<div>
		<AppClientTray v-if="os === 'windows'" />
		<AppClientMacAppMenu v-if="os === 'mac'" />
	</div>
</template>
