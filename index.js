require('dotenv').config();
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Dependencies
const fs = require('fs');
const cron = require('cron');
const AntiSpam = require('discord-anti-spam');

// Invite Link (Admin permission): https://discord.com/api/oauth2/authorize?client_id=941547226986070057&permissions=8&scope=bot

// TODO: Delete this
// client.commands = new Collection();
// const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// for (const file of command_files) {
// 	const command = require(`./commands/${file}`);
// 	// Set a new item in the Collection
// 	// With the key as the command name and the value as the exported module
// 	client.commands.set(command.data.name, command);
// }


// Files
const timeout_txt = './timeout.txt';





// #####################################################################
// ################ FUNCTIONS and GLOBAL VARIABLES #####################
// #####################################################################

const TOKEN = process.env.TOKEN;
const prefix = process.env.PREFIX;
const server_id = process.env.SERVER_ID;
const mute_rn = process.env.MUTE_RN;
const admin_rn = process.env.ADMIN_RN;
let minimum_message_length = parseInt(process.env.MIN_MESSAGE_LENGTH);

client.login(TOKEN);

// Command name variables
const modify_antispam_cn = 'modify-antispam';
const roletroll_cn = 'roletroll';



// When the bot connects
client.on('ready', () => {
	console.info(`Logged in as ${client.user.tag}!`);

	// TODO: Get rid of this?
	const guild = client.guilds.cache.get(server_id);
	let commands
	if (guild) {
		commands = guild.commands
	} else {
		commands = client.application?.commands
	}

	// roletroll
	commands?.create({
		name: roletroll_cn,
		description: `Starts and stops the ${roletroll_cn} Cron job`,
		options: [
			{
				name: 'action',
				description: 'Whether or not you want to start or stop the Cron job',
				required: true,
				type: 3 // STRING
			}
		]
	});
	
	// modify-antispam
	commands?.create({
		name: modify_antispam_cn,
		description: 'Modify the antispam object',
		options: [
			{
				name: 'attribute',
				description: 'What part of the antispam object to modify',
				required: true,
				type: 3, // STRING
				choices: [
					{ name: "muteThreshold", value: "muteThreshold"},
					{ name: "maxInterval", value: "maxInterval"},
					{ name: "maxDuplicatesInterval", value: "maxDuplicatesInterval"},
					{ name: "maxDuplicatesMute", value: "maxDuplicatesMute"},
					{ name: "unMuteTime", value: "unMuteTime"},
					{ name: "modLogsChannelName", value: "modLogsChannelName"},
					{ name: "modLogsEnabled", value: "modLogsEnabled"},
					{ name: "muteMessage", value: "muteMessage"},
					{ name: "errorMessages", value: "errorMessages"},
					{ name: "muteErrorMessage", value: "muteErrorMessage"},
					{ name: "ignoredMembers", value: "ignoredMembers"},
					{ name: "ignoredRoles", value: "ignoredRoles"},
					{ name: "ignoredGuilds", value: "ignoredGuilds"},
					{ name: "ignoredChannels", value: "ignoredChannels"},
					{ name: "ignoredPermissions", value: "ignoredPermissions"},
					{ name: "muteEnabled", value: "muteEnabled"},
					{ name: "removeMessages", value: "removeMessages"},
				] 
			},
			{
				name: 'value',
				description: 'What value to change the attribute to',
				required: true,
				type: 3 // STRING
			}
		]
	});
});



// Message a specific user. Mainly used in the Major Events logs
function modifyAntispam(attribute=false, value=false) {
	antispam_object = {
		// All of these options are found under the AntiSpamClientOptions section here: https://discord-anti-spam.js.org/global.html
		warnThreshold: 3, // Amount of messages sent in a row that will cause a warning.
		muteThreshold: 3, // Amount of messages sent in a row that will cause a mute
		kickThreshold: 5, // Amount of messages sent in a row that will cause a kick.
		banThreshold: 7, // Amount of messages sent in a row that will cause a ban.
		maxInterval: 60000, // Amount of time (in milliseconds) in which messages are considered spam.
		maxDuplicatesInterval: 60000, // Amount of time (ms) in which duplicate messages are considered spam.
		maxDuplicatesWarn: 5, // Amount of duplicate messages that trigger a warning.
		maxDuplicatesKick: 5, // Amount of duplicate messages that trigger a warning.
		maxDuplicatesMute: 2, // Amount of duplicate message that trigger a mute.
		maxDuplicatesBan: 5, // Amount of duplicate messages that trigger a warning.
		unMuteTime: 2, // Time in minutes to wait until unmuting a user.
		modLogsChannelName: '', // Name or ID of the channel in which moderation logs will be sent.
		modLogsEnabled: '', // Whether moderation logs are enabled.
		modLogsMode: 'embed', // Whether send moderations logs in an discord embed or normal message! Options: 'embed' or 'message".
		warnMessage: '{@user}, Please stop spamming.', // Message that will be sent in the channel when someone is warned.
		kickMessage: '**{user_tag}** has been kicked for spamming.', // Message that will be sent in the channel when someone is kicked.
		muteMessage: '**{user_tag}** has been muted for spamming.', // Message that will be sent in chat upon muting a user.
		banMessage: '**{user_tag}** has been banned for spamming.' , // Message that will be sent in the channel when someone is banned.
		errorMessages: true, // Whether the bot should send a message in the channel when it doesn't have some required permissions, like it can't kick members.
		kickErrorMessage: 'Could not kick **{user_tag}** because of improper permissions.', // Message that will be sent in the channel when the bot doesn't have enough permissions to kick the member.
		banErrorMessage: 'Could not ban **{user_tag}** because of improper permissions.', // Message that will be sent in the channel when the bot doesn't have enough permissions to mute the member (to add the mute role).
		muteErrorMessage: 'Could not mute **{user_tag}** because of improper permissions.', // Message that will be sent in the channel when the bot doesn't have enough permissions to ban the member.
		ignoredMembers: [], // Array of member IDs that are ignored.
		ignoredRoles: [], // Array of role IDs or role names that are ignored. Members with one of these roles will be ignored.
		ignoredGuilds: [], // Array of guild IDs or guild names that are ignored.
		ignoredChannels: [], // Array of channel IDs or channel names that are ignored.
		ignoredPermissions: [], // Bypass users with any of these permissions.
		ignoreBots: true, // Whether bots should be ignored.
		warnEnabled: false, // Whether warn sanction is enabled.
		kickEnabled: false, // Whether kick sanction is enabled.
		muteEnabled: true, // Whether mute sanction is enabled.
		banEnabled: false, // Whether ban sanction is enabled.
		deleteMessagesAfterBanForPastDays: 1, // When a user is banned, their messages sent in the last x days will be deleted.
		verbose: true, // Extended logs from module (recommended).
		debug: true, // Whether to run the module in debug mode.
		removeMessages: true, // If the bot should remove all the spam messages when taking action on a user!
		MultipleSanctions: false, // Whether to run sanctions multiple times
	}

	if (attribute !== false && value !== false) {
		for (const k in antispam_object) {
			if (k == attribute) {
				antispam_object[k] = value;
			}
		}
	}
	return new AntiSpam(antispam_object);
}

function reformatAttributeValue(attribute, value) {
	let formatted_value;
	switch (attribute) {
		// All of these options are found under the AntiSpamClientOptions section here: https://discord-anti-spam.js.org/global.html
		case 'warnThreshold':
		case 'muteThreshold':
		case 'kickThreshold':
		case 'banThreshold':
		case 'maxInterval':
		case 'maxDuplicatesInterval':
		case 'maxDuplicatesWarn':
		case 'maxDuplicatesKick':
		case 'maxDuplicatesMute':
		case 'maxDuplicatesBan':
		case 'unMuteTime':
		case 'deleteMessagesAfterBanForPastDays':
			formatted_value = parseInt(value);
		case 'ignoredMembers':
		case 'ignoredRoles':
		case 'ignoredGuilds':
		case 'ignoredChannels':
		case 'ignoredPermissions':
			formatted_value = [value.split(',')]
		case 'modLogsEnabled':
		case 'errorMessages':
		case 'ignoreBots':
		case 'warnEnabled':
		case 'kickEnabled':
		case 'muteEnabled':
		case 'banEnabled':
		case 'verbose':
		case 'debug':
		case 'removeMessages':
		case 'MultipleSanctions':
			formatted_value = value === 'true' ? true : false;
	}
	return formatted_value
}

// Setup the roletroll cron job to run: 00 * * * * *
// This runs every minute of every day of every day in the week of every week of every month of the year
let roletroll = new cron.CronJob('00 * * * * *', () => {
	console.log('reeee');
	// Check our ban list
	fs.readFile(timeout_txt, 'utf8', function(err, data) {
		// If we find any problems, explode
		if (err) throw err;

		// Split up the data so that each line is an element in this array
		let lines = data.split(/\r?\n/);
		// Create a dictionary so that we can store the user ID with the date to remove the role
		let dict = {};

		// Loop thru the array, split up the line, and put it into the dictionary as a key/value pair
		lines.forEach(line => {
			const pieces = line.split(' ');
			// Split out all the pieces into what they should be and initialized with default values
			user = pieces[0] == undefined ? '' : pieces[0];
			date = pieces[2] == undefined ? '' : pieces[1];
			time = pieces[3] == undefined ? '' : `${pieces[2]} ${pieces[3]}`;

			// Save everything into the dictionary
			dict[user] = {
				'user': user,
				'date': date,
				'time': time,
			}
		})

		// Create a list of people to remove roles from if it is their time
		let people_to_yeet_role_from = [];
		let the_broken = [];
		for (let key in dict) {
			// Change the time
			// The "toLocaleString()" looks like this: 3/20/2021, 9:12:16 PM (with some other garbage, but this is what we care about)
			date_reference = new Date(Date.now()).toLocaleString();

			if (dict[key]['date'] === date_reference.split(', ')[0] &&
				dict[key]['time'].split(':')[0] <= date_reference.split(', ')[1].split(':')[0] &&
				dict[key]['time'].split(':')[1] <= date_reference.split(', ')[1].split(':')[1] &&
				dict[key]['time'].split(' ')[1] === date_reference.split(', ')[1].split(' ')[1]) {
				people_to_yeet_role_from.push(
					{
						'user': dict[key]
					});
				delete dict[key];
			} else if (key === '' && dict[key] === '') {
				console.log('Weird case in roletroll: Ignore.');
			} else if (dict[key] === '') {
				the_broken.push(key);
			}
		}
		

		if (people_to_yeet_role_from.length >= 1) {
			people_to_yeet_role_from.forEach(person => {
				// Get the Guild and store it under the variable "guild"
				const guild = client.guilds.cache.get(server_id);
				
				// Get the role object
				const role_object = guild.roles.cache.find(roles => roles.name === mute_rn);
			
				// Grab the member we are looking for and remove their role
				guild.members.fetch(person['user']['user'])
				.then((user) => {
					// Remove the person's role
					user.roles.remove(role_object).catch(() => {
						console.log('Role could not be removed');
					})
				});
			});
		}


		// Delete all the empty entries
		for (let key in dict) {
			if (key == '') delete dict[key]
		}

		// Here is why we are doing streams rather than appendFile or appendFileSync:
		// https://stackoverflow.com/questions/3459476/how-to-append-to-a-file-in-node/43370201#43370201

		// Write every entry back to the file
		var stream = fs.createWriteStream(timeout_txt, { flags: 'w' });
		for (let key in dict) {
			stream.write(`${dict[key]['user']} ${dict[key]['date']} ${dict[key]['time']}\n`);
		}
	});
});

// Start up the roletroll by default (you can stop it/restart it with the subsequent command at the bottom)
roletroll.start();

// Set the antispam variable here (so we can change it later if needed)
let antispam = modifyAntispam();





// #####################################################################
// ########################## MAIN CODE ################################
// #####################################################################

// When the bot detects that the message has been sent
client.on('messageCreate', msg => {
	// Run this thru the anti-spam filter first
	antispam.message(msg);
	
	// Is the user who sent this message an Admin?
	const isAdmin = msg.member.roles.cache.some(role => role.name === admin_rn);

	// Initialize the guild variable so that we can get helpful information later
	const guild = client.guilds.cache.get(server_id);

	// If a user sends a message that is 10 characters or less, mute them for 10 minutes
	if (msg.content.length <= minimum_message_length) {
		// First, assign them the mute role if they don't already have it
		if (!msg.member.roles.cache.some(role => role.name === mute_rn)) {
			// Grab the actual role object
			var role = guild.roles.cache.find(role => role.name === mute_rn);
			// Assign the role object to our person
			msg.member.roles.add(role);
			msg.channel.send(`<@${msg.author.id}> has been muted for sending messages that are ${minimum_message_length} characters or less`);
			msg.delete().catch(console.error);
		} else {
			msg.delete().catch(console.error);
			return;
		}

		// Second, add them to the mute list for the roletroll to watch
		let date = new Date(Date.now());

		// Set the time based on input
		//TODO Set this based on what michael wants to do
		date.setTime(date.getTime() + 60000);

		date_thing = date.toLocaleDateString().charAt(0) === '0' ? date.toLocaleDateString().slice(1) : date.toLocaleDateString();

		// Here is why we are doing streams rather than appendFile or appendFileSync:
		// https://stackoverflow.com/questions/3459476/how-to-append-to-a-file-in-node/43370201#43370201

		// Write it to the file
		var stream = fs.createWriteStream(timeout_txt, { flags: 'a' });
		stream.write(`${msg.author.id} ${date_thing} ${date.toLocaleTimeString()}\n`);
	}

	// If this message isn't a command, or the user is a bot, or this is a DM: leave
	if (!msg.content.startsWith(prefix) || msg.author.bot || msg.channel.type == 'dm') return;

	// modify-antispam
	// Only Admins can do this
	else if (msg.content.startsWith(prefix + 'modify-antispam') && isAdmin) {
		// Rip off the command from the message contents and split the remaining pieces by a space
		let pieces_string = msg.content.slice(prefix.length + 'modify-antispam '.length).split(' ');
		
		// We should have two things: an attribute to modify, and the value to change it to. If we don't have that, tell the user they need to provide it
		if (pieces_string.length !== 2) {
			return msg.reply('Please make sure to list the attribute you wish to change and the value to change it to (e.g. modify-antispam unMuteTime 3')
		}

		// Set the antispam variable to the modified Antispam object
		antispam = modifyAntispam(pieces_string[0], pieces_string[1]);
	}
});



client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	// The names of these are inherent to the interaction object, do not try to change them
	const { commandName, options } = interaction;

	// roletroll
	if (commandName === roletroll_cn) {
		action = options.getString('action');
		is_start = action === 'start'
		is_start ? roletroll.start() : roletroll.stop();
		text = is_start ? 'started' : 'stopped';

		interaction.reply({
			content: `${roletroll_cn} has been ${text}`,
			ephemeral: true, // On the person running this command will see it
		});
	}

	// modify-antispam
	else if (commandName === modify_antispam_cn) {
		attribute = options.getString('attribute');
		value = options.getString('value');

		value = reformatAttributeValue(attribute, value);

		// Set the antispam variable to the modified Antispam object
		antispam = modifyAntispam(attribute, value);
		interaction.reply({
			content: `The ${attribute} Antispam attribute has been changed to ${value}`,
			ephemeral: true, // On the person running this command will see it
		});
	}
});





// #####################################################################
// ############################# NOTES #################################
// #####################################################################

// TODOS
// Reset index.js for discord-anti-spam

// Dependencies
// discordjs cron dotenv discord-anti-spam