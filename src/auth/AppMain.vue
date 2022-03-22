<script lang="ts" setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { AppClientBase } from '../_common/client/safe-exports';
import { Connection } from '../_common/connection/connection-service';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
import { loadCurrentLanguage } from '../_common/translate/translate.service';

onMounted(() => {
	loadCurrentLanguage();
});
</script>

<template>
	<AppCommonShell :class="{ 'is-client-offline': Connection.isClientOffline }">
		<div id="content">
			<AppErrorPage>
				<RouterView />
			</AppErrorPage>
		</div>

		<template v-if="GJ_IS_DESKTOP_APP">
			<AppClientBase />
		</template>
	</AppCommonShell>
</template>
