<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Screen } from '../screen/screen-service';
import './growl-content.styl';
import { AppGrowlDynamic } from './growl-dynamic';
import { Growl } from './growls.service';

@Options({
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
		if (this.growl.onClick) {
			this.growl.onClick(event);
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
</script>

<template>
	<div
		class="growl"
		:class="[
			'growl-type-' + growl.type,
			{
				'growl-clickable': !!growl.onclick,
				'growl-has-icon': !!growl.icon,
				'growl-sticky': growl.sticky,
			},
		]"
		@mouseover="cancelLeave"
		@mouseout="setLeaveTimer"
		@click="onClick"
	>
		<a class="growl-close" @click="remove">
			<AppJolticon icon="remove" />
		</a>

		<div class="growl-inner fill-gray">
			<template v-if="!growl.component">
				<div v-if="!!growl.icon" class="growl-icon">
					<img class="img-responsive" :src="growl.icon" alt="" />
				</div>
				<div class="growl-content">
					<h4 v-if="!!growl.title" class="growl-title">
						{{ growl.title }}
					</h4>
					<p>{{ growl.message }}</p>
				</div>
			</template>
			<AppGrowlDynamic
				v-else
				:component="growl.component"
				:props="growl.props"
				@close="remove"
			/>
		</div>
	</div>
</template>

<style lang="stylus" src="./growl.styl" scoped></style>
