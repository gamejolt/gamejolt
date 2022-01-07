import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppClientBase, ClientHistoryNavigator } from '../_common/client/safe-exports';
import { Connection } from '../_common/connection/connection-service';
import AppContactLink from '../_common/contact-link/contact-link.vue';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import { Environment } from '../_common/environment/environment.service';
import AppErrorPage from '../_common/error/page/page.vue';
import { formatDate } from '../_common/filters/date';
import AppCommonShell from '../_common/shell/shell.vue';
import { loadCurrentLanguage } from '../_common/translate/translate.service';
import AppUserBar from '../_common/user/user-bar/user-bar.vue';
import { User } from '../_common/user/user.model';
import { Store } from './store/index';

const components: any = {
	AppCommonShell,
	AppErrorPage,
	AppUserBar,
	AppCookieBanner,
	AppContactLink,
	AppClientBase,
};

@Options({
	components,
})
export default class App extends Vue {
	@State app!: Store['app'];

	curDate = new Date();

	readonly Connection = Connection;
	readonly Environment = Environment;
	readonly formatDate = formatDate;

	mounted() {
		// Will load the user in asynchronously so that the user-bar in the
		// shell will get loaded with a user.
		User.touch();

		loadCurrentLanguage();
	}

	navigateBack() {
		ClientHistoryNavigator?.back();
	}
}
