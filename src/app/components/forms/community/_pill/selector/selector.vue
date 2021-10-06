<script lang="ts" src="./selector"></script>

<template>
	<app-popper popover-class="fill-bg" height="45vh" hide-on-state-change @hide="resetSelections">
		<slot />

		<a
			v-if="selectedCommunity && withChannel"
			slot="header"
			class="-community-item -selected list-group-item"
			:class="{ '-initial': isInitial }"
			@click="unselectCommunity"
		>
			<div class="-community-img">
				<app-community-thumbnail-img :community="selectedCommunity" />
				<app-jolticon v-if="!isInitial" class="-back" icon="arrow-left" />
			</div>
			<span class="-text">
				{{ selectedCommunity.name }}
			</span>
			<app-community-verified-tick class="-tick" :community="selectedCommunity" small />
		</a>

		<div slot="popover" class="-container">
			<app-scroll-helper :when="!!selectedCommunity" />
			<div v-if="shouldShowCommunitySelector" class="-communities list-group">
				<a
					v-for="community of communities"
					:key="community.id"
					class="-community-item list-group-item"
					@click="selectCommunity(community)"
				>
					<app-community-thumbnail-img class="-community-img" :community="community" />

					<span class="-text">
						{{ community.name }}
					</span>
					<app-community-verified-tick class="-tick" :community="community" small />
				</a>
			</div>

			<div v-else class="-channels list-group">
				<template v-if="channels">
					<a
						v-for="channel of channels"
						:key="channel.id"
						class="-channel-item list-group-item"
						@click="selectChannel(channel)"
					>
						<span class="-text">
							<app-jolticon
								v-if="channel.type === 'competition'"
								v-app-tooltip="$gettext(`Game Jam`)"
								icon="jams"
							/>
							<app-jolticon
								v-if="channel.isUnpublished"
								v-app-tooltip="$gettext(`Channel is not publicly visible`)"
								icon="subscribed"
							/>

							{{ channel.displayTitle }}
						</span>
					</a>
				</template>
			</div>
		</div>
	</app-popper>
</template>

<style lang="stylus" src="./selector.styl" scoped></style>
