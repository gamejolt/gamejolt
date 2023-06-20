<script lang="ts">
import { computed, PropType, ref, toRefs, useSlots } from 'vue';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppPopper, {
	PopperPlacementType,
	PopperTriggerType,
} from '../../../../_common/popper/AppPopper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });

type ChatListItemSlot = 'leading' | 'title' | 'trailing';
</script>

<script lang="ts" setup>
const props = defineProps({
	horizontalPadding: {
		type: Number,
		default: 16,
	},
	verticalPadding: {
		type: Number,
		default: 8,
	},
	forceHover: {
		type: Boolean,
	},
	avatarSize: {
		type: Number,
		default: 30,
	},
	popperHideOnStateChange: {
		type: Boolean,
	},
	popperTrigger: {
		type: String as PropType<PopperTriggerType>,
		default: 'click',
	},
	popperPlacement: {
		type: String as PropType<PopperPlacementType>,
		default: 'bottom',
	},
	definedSlots: {
		type: Array as PropType<ChatListItemSlot[]>,
		default: undefined,
	},
});

const { definedSlots } = toRefs(props);

const slots = useSlots();

const isInview = ref(false);

const hasLeading = computed(() =>
	definedSlots?.value ? definedSlots.value.includes('leading') : !!slots['leading']
);
const hasTitle = computed(() =>
	definedSlots?.value ? definedSlots.value.includes('title') : !!slots['title']
);
const hasTrailing = computed(() =>
	definedSlots?.value ? definedSlots.value.includes('trailing') : !!slots['trailing']
);
</script>

<template>
	<AppScrollInview
		:style="{
			height: avatarSize + verticalPadding * 2 + 'px',
		}"
		:config="InviewConfig"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<AppPopper
			v-if="isInview"
			popover-class="fill-darkest"
			block
			fixed
			:placement="popperPlacement"
			:trigger="popperTrigger"
			:hide-on-state-change="popperHideOnStateChange"
		>
			<template #popover>
				<slot name="popover" />
			</template>

			<template #default>
				<a
					class="chat-list-item"
					:class="{
						'-hovered': forceHover,
					}"
					:style="{
						padding: `${verticalPadding}px ${horizontalPadding}px`,
						height: avatarSize + verticalPadding * 2 + 'px',
					}"
				>
					<div
						v-if="hasLeading"
						class="-leading"
						:style="{
							width: avatarSize + 'px',
						}"
					>
						<AppAspectRatio :ratio="1" show-overflow>
							<div class="-leading-inner">
								<slot name="leading" />
							</div>

							<div class="-leading-float">
								<slot name="leading-float" />
							</div>
						</AppAspectRatio>
					</div>

					<div v-if="hasTitle" class="-title">
						<slot name="title" />
					</div>

					<div v-if="hasTrailing" class="-trailing">
						<slot name="trailing" />
					</div>
				</a>
			</template>
		</AppPopper>
	</AppScrollInview>
</template>

<style lang="stylus" scoped>
.chat-list-item
	display: flex
	align-items: center
	color: var(--theme-fg)
	gap: 16px

	&.-hovered
	&:hover
		change-bg-rgba(var(--theme-fg-rgb), 0.1)

.-leading
	flex: none
	font-weight: 400
	font-size: $font-size-base

.-leading-inner
	overflow: hidden
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	display: flex
	z-index: 0

.-leading-float
	position: absolute
	right: -2px
	bottom: @right
	z-index: 1

.-title
	flex: auto
	display: inline-flex
	align-items: baseline
	gap: 8px
	min-width: 0

	&
	::v-deep(*)
		text-overflow()

.-trailing
	flex: none
	margin-left: auto
</style>
