import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Ruler } from '../../../_common/ruler/ruler-service';

@Component({})
export default class AppFadeCollapse extends Vue {
	height = 0;
	innerHeight = 0;
	isCollapsed = false;

	declare $el: HTMLElement;
	declare $refs: {
		inner: HTMLElement;
	};

	async mounted() {
		await this.$nextTick();
		this.height = Ruler.height(this.$el);
		this.innerHeight = Ruler.height(this.$refs.inner);

		if (this.innerHeight > this.height) {
			this.isCollapsed = true;
			this.$emit('required');
		}
	}
}
