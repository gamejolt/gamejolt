<template>
	<div class="pill-bi">
		<component :is="leftComponent" :to="toLeft" class="pill-bi-left">
			<!-- wrapped in a span to ensure all slot elements get
				the z-index to render them above the separator -->
			<span class="-content">
				<span class="-img" v-if="hasLeftImg">
					<slot name="left-img" />
				</span>
				<slot name="left" />
			</span>

			<!-- separator child of left bit so it can inherit it's background color -->
			<div
				class="-sep"
				:style="{
					left: `-${separatorWidthPx}`,
					'margin-right': `-${separatorWidthPx}`,
					width: separatorWidthPx,
					transform: separatorSkewX,
				}"
			/>
		</component>

		<component
			:is="rightComponent"
			:to="toRight"
			class="pill-bi-right"
			:style="{ 'padding-left': separatorWidthPx }"
		>
			<span class="-content">
				<span class="-img" v-if="hasRightImg">
					<slot name="right-img" />
				</span>
				<slot name="right" />
			</span>
		</component>
	</div>
</template>

<style lang="stylus" src="./bi.styl" scoped></style>

<script lang="ts" src="./bi"></script>
