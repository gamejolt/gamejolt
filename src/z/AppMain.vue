<script lang="ts" setup>
import { RouterView } from 'vue-router';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
import { useCommonStore } from '../_common/store/common-store';
import AppUserBar from '../_common/user/user-bar/AppUserBar.vue';

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
