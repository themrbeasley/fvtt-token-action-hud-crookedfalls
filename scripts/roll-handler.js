export let RollHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
     */
    RollHandler = class RollHandler extends coreModule.api.RollHandler {
        /**
         * Handle action click
         * Called by Token Action HUD Core when an action is left or right-clicked
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionClick (event, encodedValue) {
            const [actionTypeId, actionId] = encodedValue.split('|')

            // Right-clicking a tag opens its item sheet
            const renderable = ['tag']

            if (renderable.includes(actionTypeId) && this.isRenderItem()) {
                return this.doRenderItem(this.actor, actionId)
            }

            const knownCharacters = ['investigator', 'threat']

            // If single actor is selected
            if (this.actor) {
                await this.#handleAction(event, this.actor, this.token, actionTypeId, actionId)
                return
            }

            const controlledTokens = canvas.tokens.controlled
                .filter((token) => knownCharacters.includes(token.actor?.type))

            // If multiple actors are selected
            for (const token of controlledTokens) {
                const actor = token.actor
                await this.#handleAction(event, actor, token, actionTypeId, actionId)
            }
        }

        /**
         * Handle action hover
         * Called by Token Action HUD Core when an action is hovered on or off
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionHover (event, encodedValue) {}

        /**
         * Handle group click
         * Called by Token Action HUD Core when a group is right-clicked while the HUD is locked
         * @override
         * @param {object} event The event
         * @param {object} group The group
         */
        async handleGroupClick (event, group) {}

        /**
         * Handle action
         * @private
         * @param {object} event        The event
         * @param {object} actor        The actor
         * @param {object} token        The token
         * @param {string} actionTypeId The action type id
         * @param {string} actionId     The actionId
         */
        async #handleAction (event, actor, token, actionTypeId, actionId) {
            switch (actionTypeId) {
            case 'pool':
                await this.#handlePoolAction(actor, actionId)
                break
            case 'fogDefense':
                await this.#handleFogDefenseAction(actor)
                break
            case 'tag':
                await this.#handleTagAction(event, actor, actionId)
                break
            case 'power':
                await this.#handlePowerAction(actor, actionId)
                break
            case 'interference':
                await this.#handleInterferenceAction(actor, actionId)
                break
            case 'utility':
                await this.#handleUtilityAction(token, actor, actionId)
                break
            }
        }

        /**
         * Handle pool roll action (intellect, agility, willpower)
         * Delegates to the investigator sheet's roll dialog
         * @private
         * @param {object} actor   The actor
         * @param {string} poolName The pool to roll (intellect | agility | willpower)
         */
        async #handlePoolAction (actor, poolName) {
            await actor.sheet._rollPool(poolName)
        }

        /**
         * Handle fog defense action
         * Delegates to the investigator sheet's fog defense dialog
         * @private
         * @param {object} actor The actor
         */
        async #handleFogDefenseAction (actor) {
            await actor.sheet._rollFogDefense()
        }

        /**
         * Handle tag action (left-click posts to chat)
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The item id
         */
        async #handleTagAction (event, actor, actionId) {
            const item = actor.items.get(actionId)
            if (item) item.toChat(event)
        }

        /**
         * Handle power action
         * Delegates to the threat sheet's power activation/deactivation
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The item id
         */
        async #handlePowerAction (actor, actionId) {
            const item = actor.items.get(actionId)
            if (item) await actor.sheet._usePower(item)
        }

        /**
         * Handle interference action
         * Delegates to the threat sheet's interference flow
         * @private
         * @param {object} actor    The actor
         * @param {string} actionId The item id
         */
        async #handleInterferenceAction (actor, actionId) {
            const item = actor.items.get(actionId)
            if (item) await actor.sheet._useInterference(item)
        }

        /**
         * Handle utility action
         * @private
         * @param {object} token    The token
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        async #handleUtilityAction (token, actor, actionId) {
            switch (actionId) {
            case 'endTurn':
                if (game.combat?.current?.tokenId === token.id) {
                    await game.combat?.nextTurn()
                }
                break
            case 'contestedPriority':
                await game.crookedfalls.ContestedPriority.begin()
                break
            }
        }
    }
})
