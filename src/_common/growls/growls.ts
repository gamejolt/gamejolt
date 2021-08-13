import { Options, Vue } from 'vue-property-decorator';
import { Screen } from '../screen/screen-service';
import AppGrowl from './growl.vue';
import { Growls } from './growls.service';

@Options({
	components: {
		AppGrowl,
	},
})
export default class AppGrowls extends Vue {
	readonly Growls = Growls;
	readonly Screen = Screen;
}
