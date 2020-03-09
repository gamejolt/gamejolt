import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { AdSlot, AdSlotMeta, AdSlotSize } from '../ad-slot-info';
import AppAdWidgetInner from './inner.vue';

@Component({
	components: {
		AppAdWidgetInner,
	},
})
export default class AppAdWidget extends Vue {
	@Prop(propOptional(String, 'rectangle'))
	size!: AdSlotSize;

	@Prop(propOptional(Object, () => {})) meta!: AdSlotMeta;

	adSlot: AdSlot = null as any;

	get shouldShow() {
		return this.$ad.shouldShow;
	}

	created() {
		this.generateAdSlot();
	}

	// We need to make sure we update the ad slot anytime input changes.
	@Watch('size')
	@Watch('meta', { deep: true })
	generateAdSlot() {
		let { size, meta } = this;

		// For ad adapters without video support, we should the video as a
		// rectangle ad instead.
		if (!this.$ad.adapter.hasVideoSupport && size === 'video') {
			size = 'rectangle';
		}

		this.adSlot = new AdSlot(size, meta);
	}
}
