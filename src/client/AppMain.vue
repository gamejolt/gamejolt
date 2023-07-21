<script lang="ts" setup>
import { RouterView } from 'vue-router';
import AppErrorPage from '../_common/error/page/AppErrorPage.vue';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
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
