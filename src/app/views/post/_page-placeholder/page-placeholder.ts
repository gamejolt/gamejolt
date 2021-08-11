import { Options, Vue } from 'vue-property-decorator';
import { AppLazyPlaceholder } from '../../../../_common/lazy/placeholder/placeholder';

@Options({
	components: {
		AppLazyPlaceholder,
	},
})
export default class AppPostViewPlaceholder extends Vue {}
