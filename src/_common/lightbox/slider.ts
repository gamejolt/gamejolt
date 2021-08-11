import { Options, Vue } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../utils/vue';
import AppLightboxTS from './lightbox';
import AppLightbox from './lightbox.vue';

@Options({})
export default class AppLightboxSlider extends Vue {
	mounted() {
		const lightbox = findRequiredVueParent(this, AppLightbox) as AppLightboxTS;
		lightbox.setSlider(this.$el as HTMLElement);
	}
}
