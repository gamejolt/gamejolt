<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Ruler } from '../../ruler/ruler-service';
import { onScreenResize } from '../../screen/screen-service';
import { useEventSubscription } from '../../system/event/event-topic';
import AppScrollInview, { ScrollInviewConfig } from '../inview/AppScrollInview.vue';
import { Scroll } from '../scroll.service';

@Options({
	components: {
		AppScrollInview,
	},
})
export default class AppScrollAffix extends Vue {
	@Prop({ type: String, default: 'gj-scroll-affixed' }) className!: string;
	@Prop({ type: Boolean, default: false }) disabled!: boolean;
	@Prop({ type: Number, default: 0 }) scrollOffset!: number;

	@Prop({
		type: String,
		validator: i => typeof i === 'string' && ['top', 'bottom'].indexOf(i) !== -1,
		default: 'top',
	})
	anchor!: 'top' | 'bottom';

	shouldAffix = false;
	width: number | null = null;
	height = 0;
	InviewConfig!: ScrollInviewConfig;

	declare $refs: {
		container: HTMLElement;
		placeholder: HTMLElement;
	};

	get isAffixed() {
		return this.shouldAffix && !this.disabled;
	}

	get cssClasses() {
		const classes = [];
		if (this.isAffixed) {
			classes.push(this.className);
		}

		if (this.anchor === 'top') {
			classes.push('-anchor-top');
		} else if (this.anchor === 'bottom') {
			classes.push('-anchor-bottom');
		}

		return classes;
	}

	created() {
		this.createInviewConfig();

		// If we resized, then the element dimensions most likely changed.
		useEventSubscription(onScreenResize, () => {
			// Always save dimensions, even if disabled, since we need to make
			// sure that if they enable at any point we're ready to affix it
			// properly.
			if (!this.shouldAffix) {
				return;
			}

			// Pull from the placeholder which should be the source of the
			// true width now.
			const placeholder = this.$refs.placeholder;
			if (placeholder) {
				this.width = Ruler.outerWidth(placeholder);
			}
		});
	}

	outview() {
		if (this.shouldAffix) {
			return;
		}

		this.width = Ruler.outerWidth(this.$refs.container);
		this.height = Ruler.outerHeight(this.$refs.container);
		this.shouldAffix = true;
	}

	inview() {
		if (!this.shouldAffix) {
			return;
		}

		this.shouldAffix = false;
	}

	private createInviewConfig() {
		let offset = this.scrollOffset;
		if (this.anchor === 'top') {
			offset += Scroll.offsetTop;
		}

		// The 10000px is so that it only considers the element "out of view" in
		// one direction.
		const margin =
			this.anchor === 'top' ? `-${offset}px 0px 10000px 0px` : `10000px 0px -${offset}px 0px`;

		this.InviewConfig = new ScrollInviewConfig({ margin, emitsOn: 'full-overlap' });
	}
}
</script>

<template>
	<app-scroll-inview :config="InviewConfig" @inview="inview" @outview="outview">
		<div
			v-if="isAffixed"
			ref="placeholder"
			class="gj-scroll-affix-placeholder"
			:style="{ height: `${height}px` }"
		/>

		<div
			ref="container"
			class="scroll-affix-container"
			:style="{ width: isAffixed ? `${width}px` : null }"
			:class="cssClasses"
		>
			<slot />
		</div>
	</app-scroll-inview>
</template>

<style lang="stylus" scoped>
.gj-scroll-affixed
	position: fixed

.-anchor-top
	top: 0

.-anchor-bottom
	bottom: 0
</style>
