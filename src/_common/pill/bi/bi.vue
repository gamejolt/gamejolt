<template>
	<span class="pill-bi">
		<component
			:is="leftComponent"
			class="-left"
			:class="{ '-no-hover': noHover }"
			:to="leftTo"
			@click="onClickLeft"
		>
			<span class="-content">
				<span class="-img" v-if="hasImg">
					<slot name="img" />
				</span>
				<slot name="left" />
			</span>

			<span class="-sep">
				<span class="-container">
					<svg
						class="-svg"
						xmlns="http://www.w3.org/2000/svg"
						version="1.1"
						viewBox="0 0 100 100"
						preserveAspectRatio="none"
					>
						<polygon points="0,0 100,0 0,100" />
					</svg>
				</span>
			</span>
		</component>

		<component
			:is="rightComponent"
			class="-right"
			:class="{ '-no-hover': noHover }"
			:to="rightTo"
			@click="onClickRight"
		>
			<slot name="right" />
		</component>
	</span>
</template>

<style lang="stylus" src="./bi.styl" scoped></style>

<script lang="ts" src="./bi"></script>
