import { Options, Vue } from 'vue-property-decorator';
import AppLoading from '../../../_common/loading/loading.vue';
import AppModal from '../modal/modal.vue';

@Options({
	components: {
		AppModal,
		AppLoading,
	},
})
export default class AppProcessingOverlay extends Vue {}
