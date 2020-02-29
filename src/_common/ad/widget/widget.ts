import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import AppAdPlaywire from '../playwire/playwire.vue';
import './widget-content.styl';

@Component({
	components: {
		AppAdPlaywire,
	},
})
export default class AppAdWidget extends Vue {
	@Prop(propOptional(String, 'rectangle'))
	size!: 'rectangle' | 'leaderboard' | 'footer';

	@Prop(propOptional(Boolean, false)) staticSize!: boolean;

	get shouldShow() {
		return this.$ad.shouldShow;
	}
}
