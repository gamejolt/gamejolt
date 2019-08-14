<template>
	<app-form name="reportForm">
		<app-form-group name="reason" :label="$gettext(`Why are you reporting this?`)">
			<div
				class="radio"
				v-if="
					type === 'Game' || type === 'Comment' || type === 'Forum_Topic' || type === 'Forum_Post'
				"
			>
				<label>
					<app-form-control-radio type="radio" value="spam" />
					<translate>It is spam or unwanted commercial content</translate>
				</label>
			</div>
			<template v-if="type === 'Game'">
				<div class="radio">
					<label>
						<app-form-control-radio type="radio" value="abuse" />
						<translate>Incorrect maturity rating for the content in the game</translate>
					</label>
				</div>
				<div class="radio">
					<label>
						<app-form-control-radio type="radio" value="stolen" />
						<translate>Game does not belong to this developer</translate>
					</label>
				</div>
				<div class="radio">
					<label>
						<app-form-control-radio type="radio" value="no-info" />
						<translate>
							No information on game page (no screenshots, sparse description, placeholder page,
							etc.)
						</translate>
					</label>
				</div>
				<div class="radio">
					<label>
						<app-form-control-radio type="radio" value="malware" />
						<translate>Virus or other form of malware</translate>
					</label>
				</div>
			</template>
			<div
				class="radio"
				v-if="type === 'Comment' || type === 'Forum_Post' || type === 'Forum_Topic'"
			>
				<label>
					<app-form-control-radio type="radio" value="abuse" />
					<translate>It is hate speech or contains graphic content</translate>
				</label>
			</div>
			<div
				class="radio"
				v-if="type === 'Comment' || type === 'Forum_Topic' || type === 'Forum_Post'"
			>
				<label>
					<app-form-control-radio type="radio" value="explicit" />
					<translate>It is pornographic or contains sexually explicit material</translate>
				</label>
			</div>
			<div
				class="radio"
				v-if="type === 'Comment' || type === 'Forum_Topic' || type === 'Forum_Post'"
			>
				<label>
					<app-form-control-radio type="radio" value="harassment" />
					<translate>It is harassment or bullying</translate>
				</label>
			</div>
			<div class="radio" v-if="type === 'Comment'">
				<label>
					<app-form-control-radio type="radio" value="spoiler" />
					<translate>It contains spoilers and doesn't use spoiler tags</translate>
				</label>
			</div>
			<template v-if="type === 'User'">
				<div class="radio">
					<label>
						<app-form-control-radio type="radio" value="spam" />
						<translate>Spammer</translate>
					</label>
				</div>
				<div class="radio">
					<label>
						<app-form-control-radio type="radio" value="vote-manip" />
						<translate>Uprating / downrating</translate>
					</label>
				</div>
				<div class="radio">
					<label>
						<app-form-control-radio type="radio" value="explicit" />
						<translate>Profile or username contains explicit or sensitive material</translate>
					</label>
				</div>
			</template>
			<app-form-control-errors label="reason" />
		</app-form-group>

		<app-form-button>
			<translate>Send Report</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./form"></script>
