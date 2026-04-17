<script lang="ts" setup>
import { computed } from 'vue';

import AppClientMacAppMenu from '~common/client/mac-app-menu/AppClientMacAppMenu.vue';
import AppClientTray from '~common/client/tray/AppClientTray.vue';
import { getDeviceOS } from '~common/device/device.service';

const os = computed(() => getDeviceOS());
</script>

<template>
	<div>
		<AppClientTray v-if="os === 'windows'" />
		<AppClientMacAppMenu v-if="os === 'mac'" />
	</div>
</template>
