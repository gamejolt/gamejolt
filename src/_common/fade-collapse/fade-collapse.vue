<script lang="ts">
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { sleep } from '../../utils/utils';
import { Screen } from '../screen/screen-service';
import { Scroll } from '../scroll/scroll.service';

const ExtraCollapsePadding = 200;

/**
 * If the collapsed version would only leave this much pixels to expand it won't
 * collapse.
 */
const Threshold = 50;

@Options({})
export default class AppFadeCollapse extends Vue {
	@Prop({ type: Number, required: true })
	collapseHeight!: number;

	@Prop({ type: Boolean, default: false, required: false })
	isOpen!: boolean;

	@Prop({ type: Boolean, default: true, required: false })
	animate!: boolean;

	@Prop({ type: String, required: false })
	size!: 'sm';

	@Prop({ type: Boolean, default: false, required: false })
	ignoreThreshold!: boolean;

	@Prop({ type: Boolean, default: false, required: false })
	asMask!: boolean;

	@Emit('require-change')
	emitRequireChange(_isRequired: boolean) {}

	@Emit('expand')
	emitExpand(_e: Event) {}

	isCollapsed = false;
	private isPrimed = false;
	private frameRequestHandle?: number = undefined;
	private isRequired = false;

	declare $el: HTMLDivElement;

	async mounted() {
		// Let it compile DOM and wait for any images to be resized.
		await sleep(0);

		// Take threshold into account only if our collapse height is big enough
		// for threshold to matter.
		const threshold =
			!this.ignoreThreshold && this.collapseHeight > Threshold * 2 ? Threshold : 0;

		if (this.collapseHeight && this.$el.scrollHeight - threshold > this.collapseHeight) {
			this.isRequired = true;
		}

		this.emitRequireChange(this.isRequired);

		if (this.isRequired && !this.isOpen) {
			this.collapse();
		}
	}

	@Watch('isOpen')
	isOpenChanged() {
		if (!this.isRequired) {
			return;
		}

		if (this.isOpen) {
			this.expand();
		} else {
			this.collapse();
		}

		this.isPrimed = true;
	}

	/**
	 * Called when the fade at the bottom is clicked on. We want to open it up in that case so that
	 * they can actually click on what's below.
	 */
	fadeClick(e: Event) {
		this.emitExpand(e);
	}

	expand() {
		this.isCollapsed = false;
		this.$el.style.maxHeight = this.$el.scrollHeight + 'px';
	}

	collapse() {
		this.isCollapsed = true;
		this.$el.style.maxHeight = this.collapseHeight + 'px';

		if (this.isPrimed) {
			// We will scroll to the bottom of the element minus some extra padding.
			// This keeps the element in view a bit.
			const scrollTo =
				Scroll.getElementOffsetTopFromContext(this.$el) +
				this.collapseHeight -
				ExtraCollapsePadding;

			// Only if we're past where we would scroll.
			if (Scroll.getScrollTop() > scrollTo) {
				// If we're on a tiny screen, don't animate the scroll.
				// Just set it and move on.
				if (Screen.isXs || !this.animate) {
					Scroll.to(scrollTo, { animate: false });
				} else {
					// Otherwise set up a scroll animation to follow the bottom of the element as it collapses.
					this.setupScrollAnim();
				}
			}
		}
	}

	setupScrollAnim() {
		// Start the loop.
		this.frameRequestHandle = window.requestAnimationFrame(() => this.animStep());
	}

	private animStep() {
		// Bottom of element from the scroll context top.
		// We then subtract some padding so that they still see some of the element while scrolling.
		const curPos =
			Scroll.getElementOffsetTopFromContext(this.$el) +
			this.$el.offsetHeight -
			ExtraCollapsePadding;

		// Only scroll if we have to.
		// This will allow the element to collapse freely until our marker would go out of view.
		// Then we scroll.
		if (Scroll.getScrollTop() > curPos) {
			Scroll.to(curPos, { animate: false });
		}

		// Request another frame to loop again.
		this.frameRequestHandle = window.requestAnimationFrame(() => this.animStep());
	}

	// This gets called after any of our maxHeight transitions.
	afterTransition() {
		// If we are doing the collapse scroll animation, then we can stop the
		// animation handler.
		if (this.frameRequestHandle) {
			window.cancelAnimationFrame(this.frameRequestHandle);
			this.frameRequestHandle = undefined;
		}
	}
}
</script>

<template>
	<div
		class="fade-collapse"
		:class="{
			'-sm': size === 'sm',
			'-animate': animate,
			'fade-collapse-collapsed': isCollapsed,
			'-fade-mask': isCollapsed && asMask,
		}"
		@transitionend="afterTransition"
	>
		<div class="-fade" :class="{ '-fade-color': !asMask }" @click="fadeClick($event)" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.fade-collapse
	position: relative
	overflow: hidden
	--fade-height: 100px

	&.-sm
		--fade-height: 30px

	@media $media-sm-up
		&.-animate
			transition: max-height 600ms $strong-ease-out

.-fade
	position: absolute
	display: none
	bottom: 0
	left: 0
	right: 0
	height: var(--fade-height)
	z-index: 1

	// We need this full name since it's targeted in other components to change the styling.
	.fade-collapse-collapsed &
		display: block

.-fade-color
	background-image: linear-gradient(to bottom, var(--theme-bg-actual-trans) 0, var(--theme-bg-actual) 100%)

.-fade-mask
	mask-image: linear-gradient(to top, transparent 0, black var(--fade-height), black 100%)
</style>
