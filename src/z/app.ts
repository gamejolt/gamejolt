import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/shell.vue';
import { useCommonStore } from '../_common/store/common-store';
import AppUserBar from '../_common/user/user-bar/user-bar.vue';

@Options({
	components: {
		AppCommonShell,
		AppUserBar,
		AppErrorPage,
	},
})
export default class App extends Vue {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}
}
