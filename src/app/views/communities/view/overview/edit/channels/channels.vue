<template>
	<div>
		<app-community-perms :community="community" required="community-channels">
			<h2 class="section-header">
				<translate>Channels</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Channels make it easier for your community members to organize their posts into groups.
					</translate>
				</p>
				<p>
					<translate>
						Create new channels or edit the below channels for your community.
					</translate>
				</p>
			</div>

			<form-community-channel
				:community="community"
				@submit="onChannelAdded"
				:channels="community.channels"
			/>

			<ul class="-channel-list" v-if="community.channels">
				<draggable v-model="community.channels" @change="saveChannelSort">
					<li v-for="channel in community.channels" :key="channel.id">
						<a class="tag">
							{{ channel.title }}

							<a v-if="canRemoveChannel" @click.stop="onClickRemoveChannel(channel)">
								<app-jolticon icon="remove" v-app-tooltip="$gettext(`Remove Channel`)" />
							</a>
						</a>
					</li>
				</draggable>
			</ul>

			<div class="-spacer"></div>
		</app-community-perms>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-channel-list
	list-style: none
	padding-left: 0

	li
		margin-bottom: 10px

	.tag
		border-radius: 10px
		font-weight: normal
		cursor: move !important
		font-size: $font-size-base
		padding: 6px

</style>

<script lang="ts" src="./channels"></script>
