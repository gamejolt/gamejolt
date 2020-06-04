<template>
	<app-popper popover-class="fill-bg" hide-on-state-change @hide="resetSelections">
		<slot />

		<div class="-container" slot="popover">
			<div
				class="-slider"
				:class="{ '-slide-to-channels': !!selectedCommunity && selectingChannel }"
			>
				<div class="-communities list-group">
					<a
						class="-community-item list-group-item"
						v-for="community of communities"
						:key="community.id"
						@click="selectCommunity(community)"
					>
						<app-community-thumbnail-img slot="img" class="-community-img" :community="community" />

						<span class="-text">
							{{ community.name }}
						</span>
						<app-community-verified-tick class="-tick" :community="community" small />
					</a>
				</div>

				<div v-if="selectedCommunity" class="-channels list-group">
					<a
						ref="header"
						class="-community-item -selected list-group-item"
						:class="{ '-initial': isInitial }"
						@click="unselectCommunity"
					>
						<div slot="img" class="-community-img">
							<app-community-thumbnail-img :community="selectedCommunity" />
							<app-jolticon v-if="!isInitial" class="-back" icon="arrow-left" />
						</div>
						<span class="-text">
							{{ selectedCommunity.name }}
						</span>
						<app-community-verified-tick class="-tick" :community="selectedCommunity" small />
						<!-- <app-button
							v-if="selectedCommunity !== initialCommunity"
							class="-back"
							icon="arrow-left"
							@click="unselectCommunity"
						/> -->
					</a>
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
		</div>
	</app-popper>
</template>

<style lang="stylus" src="./selector.styl" scoped></style>

<script lang="ts" src="./selector"></script>
