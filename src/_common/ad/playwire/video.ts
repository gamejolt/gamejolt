import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { CreateElement } from 'vue/types/vue';
import { propRequired } from '../../../utils/vue';
import { AdSlot } from '../ad-slot-info';
import { AdPlaywireAdapter } from './playwire-adapter';

@Component({})
export default class AppAdPlaywireVideo extends Vue {
	@Prop(propRequired(AdSlot)) adSlot!: AdSlot;
	@Prop(propRequired(AdPlaywireAdapter)) adapter!: AdPlaywireAdapter;

	mounted() {
		const script = window.document.createElement('script');
		script.dataset.config = 'https://config.playwire.com/1391/playlists/v2/4898/zeus.json';

		this.$el.appendChild(script);
		script.src = 'https://cdn.playwire.com/bolt/js/zeus/embed.js';
	}

	render(h: CreateElement) {
		return h('div');
	}
}
