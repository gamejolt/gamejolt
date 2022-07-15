<script lang="ts" setup>
import { computed, onMounted, PropType, toRefs } from 'vue';
import AppGrowlDynamic from './AppGrowlDynamic.vue';
import './growl-content.styl';
import { Growl } from './growls.service';

const props = defineProps({
	index: {
		type: Number,
		required: true,
	},
	growl: {
		type: Object as PropType<Growl>,
		required: true,
	},
});

const { growl } = toRefs(props);

let _leaveTimer: NodeJS.Timer | undefined;

const classes = computed(() => {
	return [
		'growl-type-' + growl.value.type,
		{
			'growl-clickable': !!growl.value.onClick,
			'growl-has-icon': !!growl.value.icon,
			'growl-sticky': growl.value.sticky,
		},
	];
});

onMounted(() => {
	if (!growl.value.sticky) {
		setLeaveTimer();
	}
});

// When they click on the element, never auto-leave again.
// They must explictly close it after that.
function onClick(event: Event) {
	if (growl.value.onClick) {
		growl.value.onClick(event);
		remove(event);
	}
}

function remove(event?: Event) {
	if (event) {
		event.stopPropagation();
	}

	// Remove from the growls list.
	growl.value.close();
}

/**
 * After a certain amount of time has elapsed, we want to remove the growl message.
 */
function setLeaveTimer() {
	if (growl.value.sticky || _leaveTimer) {
		return;
	}

	// We store the promise so we can cancel.
	_leaveTimer = setTimeout(() => {
		remove();
	}, 4000);
}

/**
 * Cancel the leave timer if there is one set.
 */
function cancelLeave() {
	if (growl.value.sticky || !_leaveTimer) {
		return;
	}

	clearTimeout(_leaveTimer);
	_leaveTimer = undefined;
}
</script>

<template>
	<div
		class="growl"
		:class="classes"
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
			<AppGrowlDynamic v-else :growl="growl" @close="remove" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.growl
	elevate-3()
	position: relative

.growl-close
	position: absolute
	display: block
	top: 0
	right: 0
	width: 40px
	height: @width
	line-height: @height
	color: $white
	text-align: center
	z-index: 2

	&:hover
		change-bg('notice')
		theme-prop('color', 'notice-fg')

		@media $media-sm-up
			border-top-right-radius: $border-radius-large

.growl-inner
	padding: 25px 35px
	margin-top: $growl-spacing
	color: $white
	user-select: none
	// We set the border color in the different growl types.
	border-left-width: 7px
	border-left-style: solid

	@media $media-sm-up
		border-top-right-radius: $border-radius-large
		border-bottom-right-radius: $border-radius-large

.growl-content
	max-height: 200px
	overflow-y: hidden

/**
 * Clickable growl.
 */
.growl-clickable
	&:hover
		cursor: pointer

/**
 * Growl icons.
 */
.growl-icon
	float: left
	width: 45px
	height: 45px

	& > img
		display: block

.growl-has-icon .growl-content
	margin-left: 60px

/**
 * Info growl.
 */
.growl-type-info
	.growl-inner
		theme-prop('border-left-color', 'light')

/**
 * Success growl.
 */
.growl-type-success
	.growl-inner
		theme-prop('border-left-color', 'highlight')

/**
 * Error growl.
 */
.growl-type-error
	.growl-inner
		theme-prop('border-left-color', 'notice')
</style>
