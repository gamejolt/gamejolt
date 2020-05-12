import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../utils/vue';
import AppLightboxTS from './lightbox';
import AppLightbox from './lightbox.vue';

@Component({})
export default class AppLightboxSlider extends Vue {
	mounted() {
		const mediaBar = findRequiredVueParent(this, AppLightbox) as AppLightboxTS;
		mediaBar.setSlider(this.$el as HTMLElement);
	}
}
