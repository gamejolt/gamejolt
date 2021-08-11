import { Options, Vue } from 'vue-property-decorator';
import { loadCurrentLanguage } from '../utils/translations';
import { Connection } from '../_common/connection/connection-service';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/shell.vue';

const components: any = {
	AppCommonShell,
	AppErrorPage,
	AppCookieBanner,
};

if (GJ_IS_CLIENT) {
	components.AppClientBase = require('../_common/client/base/base.vue').default;
}

@Options({
	components,
})
export default class App extends Vue {
	readonly Connection = Connection;

	mounted() {
		loadCurrentLanguage(this);
	}
}
