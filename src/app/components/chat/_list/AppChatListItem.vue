<script lang="ts">
import { ref } from '@vue/runtime-core';
import { computed, useSlots } from 'vue';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });
</script>

<script lang="ts" setup>
defineProps({
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
});

const slots = useSlots();

const isInview = ref(false);

const hasLeading = computed(() => !!slots['leading']);
const hasTitle = computed(() => !!slots['title']);
const hasTrailing = computed(() => !!slots['trailing']);
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
		<a
			v-if="isInview"
			class="chat-list-item"
			:class="{
				'-hovered': forceHover,
			}"
			:style="{
				padding: `${verticalPadding}px ${horizontalPadding}px`,
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
						<slot name="leadingFloat" />
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
	img-circle()
	overflow: hidden
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	display: flex

.-leading-float
	position: absolute
	right: 0
	bottom: 0

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
