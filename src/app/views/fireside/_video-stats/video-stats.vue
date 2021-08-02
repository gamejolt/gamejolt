<script lang="ts" src="./video-stats"></script>

<template>
	<div class="-video-stats">
		<table>
			<tbody>
				<tr v-for="(v, k) of stats" :key="k">
					<th>{{ k }}</th>
					<td>{{ v }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-video-stats
	rounded-corners()
	elevate-2()
	position: absolute
	top: 12px
	left: 12px
	background-color: rgba($black, 0.7)
	padding: 12px
	color: $white
	z-index: 10

	table
		th
			text-align: right
			padding-right: 8px
</style>
