import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Screen } from '../screen/screen-service';
import { AppGrowlDynamic } from './growl-dynamic';
import { Growl } from './growls.service';

require('./growl-content.styl');

@Component({
	components: {
		AppGrowlDynamic,
	},
})
export default class AppGrowl extends Vue {
	@Prop(Number) index!: number;
	@Prop(Object) growl!: Growl;

	readonly Screen = Screen;

	private leaveTimer?: NodeJS.Timer;

	mounted() {
		if (!this.growl.sticky) {
			this.setLeaveTimer();
		}
	}

	// When they click on the element, never auto-leave again.
	// They must explictly close it after that.
	onClick(event: Event) {
		if (this.growl.onclick) {
			this.growl.onclick(event);
			this.remove(event);
		}
	}

	remove(event?: Event) {
		if (event) {
			event.stopPropagation();
		}

		// Remove from the growls list.
		this.growl.close();
	}

	/**
	 * After a certain amount of time has elapsed, we want to remove the growl message.
	 */
	setLeaveTimer() {
		if (this.growl.sticky || this.leaveTimer) {
			return;
		}

		// We store the promise so we can cancel.
		this.leaveTimer = setTimeout(() => {
			this.remove();
		}, 4000);
	}

	/**
	 * Cancel the leave timer if there is one set.
	 */
	cancelLeave() {
		if (this.growl.sticky || !this.leaveTimer) {
			return;
		}

		clearTimeout(this.leaveTimer);
		this.leaveTimer = undefined;
	}
}
