import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { AppClientBase } from '../_common/client/safe-exports';
import { Connection } from '../_common/connection/connection-service';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
import { createCommonStore } from '../_common/store/common-store';
import { loadCurrentLanguage } from '../_common/translate/translate.service';

@Options({
	components: {
		AppCommonShell,
		AppErrorPage,
		AppCookieBanner,
		AppClientBase,
	},
})
export default class App extends Vue {
	readonly Connection = Connection;

	blah = setup(() => createCommonStore());

	mounted() {
		loadCurrentLanguage();
	}
}