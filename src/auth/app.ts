import { Options, Vue } from 'vue-property-decorator';
import { Connection } from '../_common/connection/connection-service';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/shell.vue';
import { loadCurrentLanguage } from '../_common/translate/translate.service';

const components: any = {
	AppCommonShell,
	AppErrorPage,
	AppCookieBanner,
};

if (GJ_IS_DESKTOP_APP) {
	components.AppClientBase = await import('../_common/client/base/base.vue');
}

@Options({
	components,
})
export default class App extends Vue {
	readonly Connection = Connection;

	mounted() {
		loadCurrentLanguage();
	}
}
