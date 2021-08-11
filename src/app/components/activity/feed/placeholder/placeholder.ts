import { Options, Vue } from 'vue-property-decorator';
import AppActivityFeedItemPlaceholder from '../item/placeholder/placeholder.vue';

@Options({
	components: {
		AppActivityFeedItemPlaceholder,
	},
})
export default class AppActivityFeedPlaceholder extends Vue {}
