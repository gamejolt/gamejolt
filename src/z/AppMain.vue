<script lang="ts" setup>
import { RouterView } from 'vue-router';

import AppErrorPage from '~common/error/page/AppErrorPage.vue';
import AppCommonShell from '~common/shell/AppCommonShell.vue';
import { useCommonStore } from '~common/store/common-store';
import AppUserBar from '~common/user/user-bar/AppUserBar.vue';

const { user } = useCommonStore();
</script>

<template>
	<AppCommonShell>
		<AppUserBar :user="user" />

		<div id="content" class="container">
			<AppErrorPage>
				<RouterView />
			</AppErrorPage>
		</div>
	</AppCommonShell>
</template>
