require('dotenv').config();

const admin_rn = process.env.ADMIN_RN;


const page_1_choices = [
    {name: 'warnThreshold', value: 'warnThreshold'},
    {name: 'muteThreshold', value: 'muteThreshold'},
    {name: 'kickThreshold', value: 'kickThreshold'},
    {name: 'banThreshold', value: 'banThreshold'},
    {name: 'maxInterval', value: 'maxInterval'},
    {name: 'maxDuplicatesInterval', value: 'maxDuplicatesInterval'},
    {name: 'maxDuplicatesWarn', value: 'maxDuplicatesWarn'},
    {name: 'maxDuplicatesKick', value: 'maxDuplicatesKick'},
    {name: 'maxDuplicatesMute', value: 'maxDuplicatesMute'},
    {name: 'maxDuplicatesBan', value: 'maxDuplicatesBan'},
    {name: 'unMuteTime', value: 'unMuteTime'},
    {name: 'modLogsChannelName', value: 'modLogsChannelName'},
    {name: 'modLogsEnabled', value: 'modLogsEnabled'},
    {name: 'modLogsMode', value: 'modLogsMode'},
    {name: 'warnMessage', value: 'warnMessage'},
    {name: 'kickMessage', value: 'kickMessage'},
    {name: 'muteMessage', value: 'muteMessage'},
    {name: 'banMessage', value: 'banMessage'},
    {name: 'errorMessages', value: 'errorMessages'},
    {name: 'kickErrorMessage', value: 'kickErrorMessage'},
    {name: 'banErrorMessage', value: 'banErrorMessage'},
    {name: 'muteErrorMessage', value: 'muteErrorMessage'},
    {name: 'ignoredMembers', value: 'ignoredMembers'},
    {name: 'ignoredRoles', value: 'ignoredRoles'},
    {name: 'more...', value: 'more'}
];
const page_2_choices = [
    {name: 'Not needed', value: 'not_needed'},
    {name: 'ignoredGuilds', value: 'ignoredGuilds'},
    {name: 'ignoredChannels', value: 'ignoredChannels'},
    {name: 'ignoredPermissions', value: 'ignoredPermissions'},
    {name: 'ignoreBots', value: 'ignoreBots'},
    {name: 'warnEnabled', value: 'warnEnabled'},
    {name: 'kickEnabled', value: 'kickEnabled'},
    {name: 'muteEnabled', value: 'muteEnabled'},
    {name: 'banEnabled', value: 'banEnabled'},
    {name: 'deleteMessagesAfterBanForPastDays', value: 'deleteMessagesAfterBanForPastDays'},
    {name: 'verbose', value: 'verbose'},
    {name: 'debug', value: 'debug'},
    {name: 'removeMessages', value: 'removeMessages'},
    {name: 'MultipleSanctions', value: 'MultipleSanctions'}
];

function getCommands() {
    // Create commands here
    return [
        // roletroll
        {
            name: 'roletroll',
            description: `Starts and stops the roletroll Cron job`,
            permission: admin_rn,
            options: [
                {
                    name: 'action',
                    description: 'Whether or not you want to start or stop the Cron job',
                    required: true,
                    type: 3, // STRING
                    choices: [
                        {name: 'Start', value: 'start'},
                        {name: 'Stop', value: 'stop'}
                    ]
                }
            ]
        },

        // modify-antispam
        {
            name: 'modify-antispam',
            description: 'Modify the antispam object',
            options: [
                {
                    name: 'attribute',
                    description: 'What part of the antispam object to modify',
                    required: true,
                    type: 3, // STRING
                    choices: page_1_choices
                },
                {
                    name: 'attribute-continued',
                    description: 'What part of the antispam object to modify',
                    required: true,
                    type: 3, // STRING
                    choices: page_2_choices
                },
                {
                    name: 'value',
                    description: 'What value to change the attribute to',
                    required: true,
                    type: 3 // STRING
                }
            ]
        },

        // print-antispam-attribute
        {
            name: 'print-antispam-attribute',
            description: `Prints the current value of the provided attribute in the antispam object`,
            options: [
                {
                    name: 'attribute',
                    description: 'What attribute you would like to see the value of',
                    required: true,
                    type: 3, // STRING
                    choices: page_1_choices
                },
                {
                    name: 'attribute-continued',
                    description: 'What attribute you would like to see the value of',
                    required: true,
                    type: 3, // STRING
                    choices: page_2_choices
                }
            ]
        },
    ];
}

// Export the function names so we can actually access them (and also so that only these are exposed)
module.exports = { getCommands };