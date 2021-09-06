<script lang="ts" src="./add"></script>

<template>
	<app-form name="firesideAddForm">
		<app-form-group name="title" hide-label>
			<div class="help-block">
				<translate>Give your Fireside a snappy title to draw people in.</translate>
			</div>
			<app-form-control
				v-app-focus-when
				type="text"
				:rules="{
					min: 4,
					max: 100,
				}"
				:validate-on="['blur']"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="community_id" hide-label>
			<div class="help-block">
				<translate>
					Select a community that represents what your Fireside's content will be like.
					PLS MAKE BETTER TEXT help
				</translate>
			</div>

			<app-forms-community-pill
				v-if="selectedCommunity"
				:community="selectedCommunity"
				:with-channel="false"
				@remove="onRemoveCommunity"
			/>
			<app-forms-community-pill-add
				v-else
				:communities="communities"
				:with-channel="false"
				@add-community="onAddCommunity"
			/>
		</app-form-group>

		<template v-if="showAdvancedCommunityOptions">
			<app-form-group
				name="auto_feature"
				:label="$gettext(`Automatically feature in Community?`)"
			>
				<app-form-control-toggle class="pull-right" />

				<p class="help-block">
					<translate>
						Will automatically feature this Fireside in the selected Community when it
						gets published.
					</translate>
				</p>
			</app-form-group>

			<app-form-group
				name="add_community_as_cohosts"
				:label="$gettext(`Add Community collaborators as Fireside co-hosts?`)"
			>
				<app-form-control-toggle class="pull-right" />

				<p class="help-block">
					<translate>
						Will add all Community collaborators as Fireside co-hosts and chat
						moderators when it gets created.
					</translate>
				</p>
			</app-form-group>
		</template>

		<app-form-button icon="fireside" :disabled="!valid">
			<translate>LET'S GO</translate>
		</app-form-button>
		<app-form-button
			:solid="false"
			:primary="false"
			:disabled="!valid"
			trans
			@before-submit="onDraftSubmit()"
		>
			<translate>Start as Draft</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
