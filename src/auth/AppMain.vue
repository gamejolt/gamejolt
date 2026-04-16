<script lang="ts" setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

import { AppClientBase } from '~common/client/safe-exports';
import { Connection } from '~common/connection/connection-service';
import AppErrorPage from '~common/error/page/AppErrorPage.vue';
import AppCommonShell from '~common/shell/AppCommonShell.vue';
import { loadCurrentLanguage } from '~common/translate/translate.service';

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
