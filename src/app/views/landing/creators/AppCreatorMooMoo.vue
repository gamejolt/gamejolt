<script lang="ts" setup>
const moomooWidth = 70;
const moomooHeight = 35;
const mPath = `M24.1737 14.3505L8.38119 33.0065L0.772005 22.1169L21.7373 3.34891L37.1056 14.0705L47.386 0.252628L70.7271 23.5059L61.1165 32.5245L47.6693 14.8317L35.1359 27.0814L24.1737 14.3505Z`;
const wPath = `M22.9344 19.9755L8.15959 0.789419L0.202878 11.3923L20.0699 30.8736L35.665 20.7133L45.2124 34.8736L69.1917 12.4838L60.102 3.13888L46.1061 20.3275L34.2726 7.653L22.9344 19.9755Z`;
</script>

<template>
	<div class="-moomoo">
		<div
			v-for="i of 5"
			:key="`moomoo-${i}`"
			:class="{ [`-moomoo-${i === 1 || i === 4 ? 'w' : 'm'}`]: true }"
			:style="{
				height: moomooHeight * (i === 1 || i === 4 ? 0.5 : 1) + 'px',
			}"
		>
			<svg :width="moomooWidth + 'px'" :height="moomooHeight + 'px'">
				<path
					:d="i === 1 || i === 4 ? wPath : mPath"
					:width="moomooWidth + 'px'"
					:height="moomooHeight + 'px'"
					fill="#FF3FAC"
				/>
			</svg>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-moomoo
	position: absolute
	top: 0
	left: 0
	transform: translate3d(-50%, -15%, 0) rotate(14.73deg)
	width: 147px
	opacity: 0.4
	display: grid
	z-index: -1

	> *
		transform: rotate(-14.73deg)
		display: inline-flex
		justify-content: center
		align-items: center

.-moomoo-m
	justify-self: flex-start
	margin-left: 0px

	&:nth-child(3)
		margin-left: 16px

.-moomoo-w
	margin-right: 8px
	justify-self: flex-end
</style>
