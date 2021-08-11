import { Options, Vue } from 'vue-property-decorator';
import AppButtonPlaceholder from '../../../../../../_common/button/placeholder/placeholder.vue';

@Options({
	components: {
		AppButtonPlaceholder,
	},
})
export default class AppActivityFeedItemPlaceholder extends Vue {}
