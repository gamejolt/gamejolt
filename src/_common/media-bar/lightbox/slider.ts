import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import AppMediaBarLightboxTS from './lightbox';
import AppMediaBarLightbox from './lightbox.vue';

@Component({})
export default class AppMediaBarLightboxSlider extends Vue {
	mounted() {
		const mediaBar = findRequiredVueParent(this, AppMediaBarLightbox) as AppMediaBarLightboxTS;
		mediaBar.setSlider(this.$el as HTMLElement);
	}
}
