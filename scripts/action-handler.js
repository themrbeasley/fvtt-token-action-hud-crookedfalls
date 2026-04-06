// System Module Imports
import { ACTION_TYPE } from './constants.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    /**
     * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
     */
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
        /**
         * Build system actions
         * Called by Token Action HUD Core
         * @override
         * @param {array} groupIds
         */
        async buildSystemActions (groupIds) {
            this.actors = (!this.actor) ? this._getActors() : [this.actor]
            this.actorType = this.actor?.type

            if (this.actorType === 'investigator') {
                await this.#buildInvestigatorActions()
            } else if (this.actorType === 'threat') {
                await this.#buildThreatActions()
            } else if (!this.actor) {
                this.#buildMultipleTokenActions()
            }
            // npc: no mechanical actions
        }

        /**
         * Build investigator actions (pool rolls, fog defense, tags)
         * @private
         */
        async #buildInvestigatorActions () {
            this.#buildPools()
            this.#buildFogDefense()
            this.#buildTags()
            this.#buildCombat()
        }

        /**
         * Build threat actions (powers and interference)
         * @private
         */
        async #buildThreatActions () {
            this.#buildPowers()
            this.#buildInterference()
            this.#buildCombat()
        }

        /**
         * Build multiple token actions
         * @private
         */
        #buildMultipleTokenActions () {
        }

        /**
         * Build pool roll actions (Intellect, Agility, Willpower)
         * @private
         */
        #buildPools () {
            const actionTypeId = 'pool'
            const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId])
            const groupData = { id: 'pools', type: 'system' }

            const pools = [
                { id: 'intellect', name: coreModule.api.Utils.i18n('tokenActionHud.crookedfalls.intellect') },
                { id: 'agility',   name: coreModule.api.Utils.i18n('tokenActionHud.crookedfalls.agility') },
                { id: 'willpower', name: coreModule.api.Utils.i18n('tokenActionHud.crookedfalls.willpower') }
            ]

            const actions = pools.map(pool => ({
                id: pool.id,
                name: pool.name,
                listName: `${actionTypeName ? `${actionTypeName}: ` : ''}${pool.name}`,
                encodedValue: [actionTypeId, pool.id].join(this.delimiter)
            }))

            this.addActions(actions, groupData)
        }

        /**
         * Build fog defense action
         * @private
         */
        #buildFogDefense () {
            const actionTypeId = 'fogDefense'
            const name = coreModule.api.Utils.i18n('tokenActionHud.crookedfalls.fogDefense')
            const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId])
            const groupData = { id: 'fogDefense', type: 'system' }

            const actions = [{
                id: 'fogDefense',
                name,
                listName: `${actionTypeName ? `${actionTypeName}: ` : ''}${name}`,
                encodedValue: [actionTypeId, 'fogDefense'].join(this.delimiter)
            }]

            this.addActions(actions, groupData)
        }

        /**
         * Build tag actions (narrative tags and item tags)
         * @private
         */
        #buildTags () {
            if (!this.actor) return

            const eligibleTags = this.actor.items.filter(i => {
                if (i.type !== 'tag') return false
                if (i.system.kind === 'wound') return false
                if (i.name === 'Incapacitated') return false
                if (i.system.kind === 'item' && i.system.uses_enabled && i.system.uses_value <= 0) return false
                return true
            })

            const actionTypeId = 'tag'
            const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId])

            // Narrative tags → 'tags' group
            const narrativeTags = eligibleTags
                .filter(i => i.system.kind === 'tag')
                .sort((a, b) => a.name.localeCompare(b.name))

            if (narrativeTags.length > 0) {
                const groupData = { id: 'tags', type: 'system' }
                const actions = narrativeTags.map(item => ({
                    id: item.id,
                    name: item.name,
                    listName: `${actionTypeName ? `${actionTypeName}: ` : ''}${item.name}`,
                    encodedValue: [actionTypeId, item.id].join(this.delimiter)
                }))
                this.addActions(actions, groupData)
            }

            // Item tags → 'items' group (show use count when tracked)
            const itemTags = eligibleTags
                .filter(i => i.system.kind === 'item')
                .sort((a, b) => a.name.localeCompare(b.name))

            if (itemTags.length > 0) {
                const groupData = { id: 'items', type: 'system' }
                const actions = itemTags.map(item => {
                    const useSuffix = item.system.uses_enabled
                        ? ` (${item.system.uses_value}/${item.system.uses_max})`
                        : ''
                    const name = `${item.name}${useSuffix}`
                    return {
                        id: item.id,
                        name,
                        listName: `${actionTypeName ? `${actionTypeName}: ` : ''}${name}`,
                        encodedValue: [actionTypeId, item.id].join(this.delimiter)
                    }
                })
                this.addActions(actions, groupData)
            }
        }

        /**
         * Build power actions for threats
         * @private
         */
        #buildPowers () {
            if (!this.actor) return

            const powers = this.actor.items
                .filter(i => i.type === 'power')
                .sort((a, b) => a.name.localeCompare(b.name))

            if (powers.length === 0) return

            const actionTypeId = 'power'
            const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId])
            const groupData = { id: 'powers', type: 'system' }

            const actions = powers.map(item => {
                const isActive = item.system.active ?? false
                const name = isActive ? `[Active] ${item.name}` : item.name
                return {
                    id: item.id,
                    name,
                    listName: `${actionTypeName ? `${actionTypeName}: ` : ''}${item.name}`,
                    encodedValue: [actionTypeId, item.id].join(this.delimiter)
                }
            })

            this.addActions(actions, groupData)
        }

        /**
         * Build interference actions for threats
         * @private
         */
        #buildInterference () {
            if (!this.actor) return

            const interferences = this.actor.items
                .filter(i => i.type === 'interference')
                .sort((a, b) => a.name.localeCompare(b.name))

            if (interferences.length === 0) return

            const actionTypeId = 'interference'
            const actionTypeName = coreModule.api.Utils.i18n(ACTION_TYPE[actionTypeId])
            const groupData = { id: 'interference', type: 'system' }

            const actions = interferences.map(item => ({
                id: item.id,
                name: item.name,
                listName: `${actionTypeName ? `${actionTypeName}: ` : ''}${item.name}`,
                encodedValue: [actionTypeId, item.id].join(this.delimiter)
            }))

            this.addActions(actions, groupData)
        }

        /**
         * Build combat utility actions (End Turn, Contested Priority)
         * @private
         */
        #buildCombat () {
            const actionTypeId = 'utility'
            const groupData = { id: 'combat', type: 'system' }
            const actions = []

            if (game.combat) {
                const name = coreModule.api.Utils.i18n('tokenActionHud.endTurn')
                actions.push({
                    id: 'endTurn',
                    name,
                    listName: name,
                    encodedValue: [actionTypeId, 'endTurn'].join(this.delimiter)
                })
            }

            if (game.user.isGM && this.actorType === 'investigator') {
                const name = coreModule.api.Utils.i18n('tokenActionHud.crookedfalls.contestedPriority')
                actions.push({
                    id: 'contestedPriority',
                    name,
                    listName: name,
                    encodedValue: [actionTypeId, 'contestedPriority'].join(this.delimiter)
                })
            }

            if (actions.length > 0) this.addActions(actions, groupData)
        }
    }
})
