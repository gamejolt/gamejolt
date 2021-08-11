import { Options, Vue } from 'vue-property-decorator';
import { AppPostCardAspectRatio } from './card';

@Options({})
export default class AppPostCardPlaceholder extends Vue {
	readonly aspectRatio = AppPostCardAspectRatio;
}
