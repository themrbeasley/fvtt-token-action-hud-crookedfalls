import { GROUP } from './constants.js'

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const groups = GROUP
    Object.values(groups).forEach(group => {
        group.name = coreModule.api.Utils.i18n(group.name)
        group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`
    })
    const groupsArray = Object.values(groups)
    DEFAULTS = {
        layout: [
            {
                nestId: 'actions',
                id: 'actions',
                name: coreModule.api.Utils.i18n('tokenActionHud.crookedfalls.actions'),
                groups: [
                    { ...groups.pools,        nestId: 'actions_pools' },
                    { ...groups.fogDefense,   nestId: 'actions_fogDefense' },
                    { ...groups.powers,       nestId: 'actions_powers' },
                    { ...groups.interference, nestId: 'actions_interference' }
                ]
            },
            {
                nestId: 'tags',
                id: 'tags',
                name: coreModule.api.Utils.i18n('tokenActionHud.crookedfalls.tagsTab'),
                groups: [
                    { ...groups.tags,  nestId: 'tags_tags' },
                    { ...groups.items, nestId: 'tags_items' }
                ]
            },
            {
                nestId: 'utility',
                id: 'utility',
                name: coreModule.api.Utils.i18n('tokenActionHud.utility'),
                groups: [
                    { ...groups.combat,  nestId: 'utility_combat' },
                    { ...groups.token,   nestId: 'utility_token' },
                    { ...groups.utility, nestId: 'utility_utility' }
                ]
            }
        ],
        groups: groupsArray
    }
})
