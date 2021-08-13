<script lang="ts" src="./growl"></script>

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
			<app-jolticon icon="remove" />
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
			<app-growl-dynamic
				v-else
				:component="growl.component"
				:props="growl.props"
				@close="remove"
			/>
		</div>
	</div>
</template>

<style lang="stylus" src="./growl.styl" scoped></style>
