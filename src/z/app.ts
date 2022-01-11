import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/shell.vue';
import AppUserBar from '../_common/user/user-bar/user-bar.vue';
import { Store } from './store';

@Options({
	components: {
		AppCommonShell,
		AppUserBar,
		AppErrorPage,
	},
})
export default class App extends Vue {
	@State app!: Store['app'];
}
