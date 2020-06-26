import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store';
import AppShellFooter from '../footer/footer.vue';

@Component({
	components: {
		AppShellFooter,
	},
})
export default class AppShellBody extends Vue {
	@State hasContentSidebar!: Store['hasContentSidebar'];
}
