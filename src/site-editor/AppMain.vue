<script lang="ts" setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import AppErrorPage from '../_common/error/page/AppErrorPage.vue';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
import { loadCurrentLanguage } from '../_common/translate/translate.service';
import AppSiteEditor from './components/site-editor/site-editor.vue';

onMounted(() => {
	loadCurrentLanguage();
});
</script>

<template>
	<AppCommonShell>
		<div id="shell">
			<div id="content">
				<AppErrorPage>
					<AppSiteEditor />
					<RouterView />
				</AppErrorPage>
			</div>
		</div>
	</AppCommonShell>
</template>
