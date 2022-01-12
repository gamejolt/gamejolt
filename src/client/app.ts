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
