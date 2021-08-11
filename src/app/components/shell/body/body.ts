import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store';
import AppShellFooter from '../footer/footer.vue';

@Options({
	components: {
		AppShellFooter,
	},
})
export default class AppShellBody extends Vue {
	@State hasContentSidebar!: Store['hasContentSidebar'];
	@State hasFooter!: Store['hasFooter'];
}
