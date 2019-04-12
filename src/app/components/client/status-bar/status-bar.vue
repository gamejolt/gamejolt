<template>
	<div
		class="status-bar fill-darker clearfix"
		:class="{
			'-is-showing': isShowing,
		}"
	>
		<div class="pull-left">
			<div class="-item" v-if="numPlaying > 0">
				<app-jolticon icon="play" />
				<translate>Currently Playing:</translate>
				<strong :title="currentlyPlayingList">
					{{ currentlyPlayingList }}
				</strong>
			</div>

			<router-link
				class="-item link-unstyled"
				v-if="numPatching > 0"
				:to="{ name: 'library.installed' }"
				v-app-tooltip="$gettext(`View Downloads`)"
			>
				<translate
					:translate-n="numPatching || 0"
					:translate-params="{ count: number(numPatching || 0) }"
					translate-plural="%{ count } Downloads"
				>
					%{ count } Download
				</translate>
				<nbsp />
				<div class="-progress">
					<app-client-status-bar-patch-item
						v-for="packageId of currentlyPatchingIds"
						:key="packageId"
						:package-id="packageId"
					/>
				</div>
			</router-link>
		</div>

		<div class="pull-right">
			<div class="-item" v-if="hasUpdate || showUpdaterIssue">
				<b>
					<template v-if="hasUpdate">
						<translate>New Client version available!</translate>
						<a @click="updateApply()">
							<translate>Update now</translate>
						</a>
					</template>
					<template v-else>
						<translate>Uh oh, client has trouble updating!</translate>
						<a class="-notice" @click="quitClient()">
							<app-jolticon notice icon="notice" />
							<translate>Try restarting</translate>
						</a>
						<nbsp />
						<a class="-dismiss" @click="dismissUpdaterWarning()">
							<app-jolticon class="-dismiss" icon="remove" />
						</a>
					</template>
				</b>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.status-bar
	padding: 0 10px
	height: $status-bar-height
	line-height: @height
	font-size: $font-size-tiny
	transform: translateY($status-bar-height)
	transition: transform 250ms $strong-ease-out

	&.-is-showing
		transform: translateY(0)

	.jolticon
		vertical-align: middle

.-progress
	display: inline-block
	width: 200px

.-item
	text-overflow()
	float: left
	margin-right: 30px
	max-width: 350px

	.pull-right &
		margin-right: 0
		margin-left: 30px

	.jolticon
		margin-top: -5px

.-notice
	theme-prop('color', 'notice')

.-dismiss
	theme-prop('color', 'white')
</style>

<script lang="ts" src="./status-bar"></script>
