import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppScrollScroller from '../../../_common/scroll/scroller/scroller.vue';

@Component({
	components: {
		AppScrollScroller,
	},
})
export default class AppModal extends Vue {
	@Prop(Boolean) hideClose!: boolean;

	close() {
		this.$emit('close');
	}
}
