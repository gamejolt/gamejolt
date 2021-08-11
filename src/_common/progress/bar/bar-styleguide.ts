import { Options, Vue } from 'vue-property-decorator';
import AppProgressBar from './bar.vue';

@Options({
	components: {
		AppProgressBar,
	},
})
export default class AppProgressBarStyleguide extends Vue {
	progress = 0;
}
