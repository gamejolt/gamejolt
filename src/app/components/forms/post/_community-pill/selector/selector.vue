<template>
	<app-popper popover-class="fill-bg" height="45vh" hide-on-state-change @hide="resetSelections">
		<slot />

		<a
			v-if="selectedCommunity"
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
			<div v-if="!selectedCommunity" class="-communities list-group">
				<a
					class="-community-item list-group-item"
					v-for="community of communities"
					:key="community.id"
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
						class="-channel-item list-group-item"
						v-for="channel of channels"
						:key="channel.id"
						@click="selectChannel(channel)"
					>
						<span class="-text">
							{{ channel.title }}
						</span>
					</a>
				</template>
			</div>
		</div>
	</app-popper>
</template>

<style lang="stylus" src="./selector.styl" scoped></style>

<script lang="ts" src="./selector"></script>
