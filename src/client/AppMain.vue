<script lang="ts" setup>
import { RouterView } from 'vue-router';

import AppErrorPage from '~common/error/page/AppErrorPage.vue';
import AppCommonShell from '~common/shell/AppCommonShell.vue';
</script>

<template>
	<AppCommonShell>
		<div id="content">
			<AppErrorPage>
				<RouterView />
			</AppErrorPage>
		</div>
	</AppCommonShell>
</template>
