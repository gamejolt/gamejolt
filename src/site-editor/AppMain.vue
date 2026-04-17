<script lang="ts" setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

import AppErrorPage from '~common/error/page/AppErrorPage.vue';
import AppCommonShell from '~common/shell/AppCommonShell.vue';
import { loadCurrentLanguage } from '~common/translate/translate.service';
import AppSiteEditor from '~site-editor/components/site-editor/AppSiteEditor.vue';

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
