import { Options, Vue } from 'vue-property-decorator';
import AppButtonPlaceholder from '../../../button/placeholder/placeholder.vue';

@Options({
	components: {
		AppButtonPlaceholder,
	},
})
export default class AppUserCardPlaceholder extends Vue {}
