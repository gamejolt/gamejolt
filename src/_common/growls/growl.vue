<template>
	<transition>
		<div
			class="growl"
			:class="[
				'growl-type-' + growl.type,
				{
					'anim-fade-enter-left anim-fade-leave-left': !Screen.isXs,
					'anim-fade-enter-down anim-back-leave-down': Screen.isXs,
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
					<div class="growl-icon" v-if="!!growl.icon">
						<img class="img-responsive" :src="growl.icon" alt="" />
					</div>
					<div class="growl-content">
						<h4 class="growl-title" v-if="!!growl.title">
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
	</transition>
</template>

<style lang="stylus" src="./growl.styl" scoped></style>

<script lang="ts" src="./growl"></script>
