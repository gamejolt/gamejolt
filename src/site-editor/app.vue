<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
import { loadCurrentLanguage } from '../_common/translate/translate.service';
import AppSiteEditor from './components/site-editor/site-editor.vue';

@Options({
	components: {
		AppCommonShell,
		AppErrorPage,
		AppSiteEditor,
	},
})
export default class App extends Vue {
	mounted() {
		loadCurrentLanguage();
	}
}
</script>

<template>
	<app-common-shell>
		<div id="shell">
			<div id="content">
				<app-error-page>
					<app-site-editor />
					<router-view />
				</app-error-page>
			</div>
		</div>
	</app-common-shell>
</template>
