<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';

@Options({
	components: {
		AppCommonShell,
		AppErrorPage,
	},
})
export default class App extends Vue {}
</script>

<template>
	<app-common-shell>
		<div id="content">
			<app-error-page>
				<router-view />
			</app-error-page>
		</div>
	</app-common-shell>
</template>
