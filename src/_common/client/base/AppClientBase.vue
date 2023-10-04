<script lang="ts" setup>
import { computed } from 'vue';
import { getDeviceOS } from '../../device/device.service';
import { AppClientMacAppMenu } from '../mac-app-menu/mac-app-menu';
import AppClientTray from '../tray/AppClientTray.vue';

const os = computed(() => {
	return getDeviceOS();
});
</script>

<template>
	<div>
		<AppClientTray v-if="os === 'windows'" />
		<AppClientMacAppMenu v-if="os === 'mac'" />
	</div>
</template>
