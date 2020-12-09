import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppLoading from '../../../_common/loading/loading.vue';
import AppModal from '../modal/modal.vue';

@Component({
	components: {
		AppModal,
		AppLoading,
	},
})
export default class AppProcessingOverlay extends Vue {}
