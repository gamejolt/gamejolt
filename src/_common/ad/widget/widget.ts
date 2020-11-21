import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { AdSlot, AdSlotMeta, AdSlotPlacement, AdSlotSize } from '../ad-slot-info';
import AppAdWidgetInner from './inner.vue';

@Component({
	components: {
		AppAdWidgetInner,
	},
})
export default class AppAdWidget extends Vue {
	@Prop(propOptional(String, 'rectangle')) size!: AdSlotSize;
	@Prop(propOptional(String, 'content')) placement!: AdSlotPlacement;
	@Prop(propOptional(Object, () => ({}))) meta!: AdSlotMeta;

	adSlot: AdSlot = null as any;

	get shouldShow() {
		return this.$ad.shouldShow;
	}

	created() {
		this.generateAdSlot();
	}

	// We need to make sure we update the ad slot anytime input changes.
	@Watch('size')
	@Watch('placement')
	@Watch('meta', { deep: true })
	generateAdSlot() {
		const { size, placement, meta } = this;
		this.adSlot = new AdSlot(size, placement, meta);
	}
}
