<script lang="ts" src="./menu"></script>

<template>
	<app-popper popover-class="fill-darkest" placement="bottom" @show="onShowPopper">
		<app-button v-app-tooltip="$gettext(`Manage...`)" circle sparse trans icon="ellipsis-h" />

		<template #popover>
			<div class="fill-darker">
				<div class="list-group list-group-dark">
					<template v-if="shouldShowEdit">
						<a class="list-group-item has-icon" @click="onClickEditTitle">
							<app-jolticon icon="edit" />
							<translate>Change title</translate>
						</a>

						<hr />
					</template>

					<app-loading-fade :is-loading="isLoadingNotificationSettings">
						<h5 class="-header list-group-item">
							<translate>Notifications</translate>
						</h5>

						<a
							v-for="setting of notificationSettings"
							:key="setting.level"
							class="list-group-item has-icon"
							@click="onClickSetNotificationLevel(setting.level)"
						>
							<app-jolticon
								:icon="
									setting.level === notificationLevel
										? 'radio-circle-filled'
										: 'radio-circle'
								"
							/>
							{{ setting.text }}
						</a>
					</app-loading-fade>
				</div>
			</div>
		</template>
	</app-popper>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-header
	font-family: $font-family-heading
	font-size: $font-size-tiny
	font-weight: normal
	letter-spacing: 0.1em
	line-height: 1
	text-transform: uppercase
	margin-top: 0
	margin-bottom: 0
</style>
