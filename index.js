require('dotenv').config();
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Dependencies
const fs = require('fs');
const cron = require('cron');
const AntiSpam = require('./discord-anti-spam.js');
const slash_commands = require('./commands.js');



// #####################################################################
// ################ FUNCTIONS and GLOBAL VARIABLES #####################
// #####################################################################

// const prefix = process.env.PREFIX;
const TOKEN = process.env.TOKEN;
const server_id = process.env.SERVER_ID;
const mute_rn = process.env.MUTE_RN;
const admin_rn = process.env.ADMIN_RN;
// const channels_to_watch = process.env.CHANNELS.split(' ');
// const minimum_message_length = 5;

// Files
const timeout_txt = './timeout.txt';
const unaccepted_words_txt = './unaccepted_words.txt';





client.login(TOKEN);

// When the bot connects
client.on('ready', () => {
	console.info(`Logged in as ${client.user.tag}!`);

	// Comment out this line to register slash commands with the application (this takes an hour to take effect so only do this after rigorous testing is complete)
	// const guild = client.guilds.cache.get(server_id);

	let commands
	if (guild) {
		commands = guild.commands
	} else {
		commands = client.application?.commands
	}

	// TODO put commands here
	slash_commands.getCommands().forEach(command => {
		commands?.create(command);
	});
});



// Modify the AntiSpam object by changing the requested attribute's value
function modifyAntispam(attribute='~~~', value='~~~') {
	// All of these options are found under the AntiSpamClientOptions section here: https://discord-anti-spam.js.org/global.html
	antispam_object = {
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

	// If this isn't the initialization call, set the value of the attribute to whatever is requested
	if (attribute !== '~~~' && value !== '~~~') {
		for (const k in antispam_object) {
			if (k == attribute) {
				antispam_object[k] = value;
			}
		}
	}

	// Return a new AntiSpam object with the ability to call the customMuteUser function
	return new AntiSpam(antispam_object, customMuteUser);
}

// Attributes get returned from the slash command as strings. We need to make sure they are reformatted to what discord-anti-spam can understand
function reformatAttributeValue(attribute, value) {
	let formatted_value = attribute;
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
			break;
		case 'ignoredMembers':
		case 'ignoredRoles':
		case 'ignoredGuilds':
		case 'ignoredChannels':
		case 'ignoredPermissions':
			formatted_value = [value.split(',')];
			break;
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
			break;
	}
	return formatted_value
}

// A custom function that will "mute" a user by simply assigning them a role and then logging their ID to a file
function customMuteUser(msg, guild, mute_message) {
	// First, assign them the mute role if they don't already have it
	if (!msg.member.roles.cache.some(role => role.name === mute_rn)) {
		// Grab the actual role object
		var role = guild.roles.cache.find(role => role.name === mute_rn);
		// Assign the role object to our person
		msg.member.roles.add(role);
		msg.channel.send(mute_message);
		msg.delete().catch(console.error);
	}
	// If they already have it, do nothing but delete their message
	else {
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
	// If they are already in the list, then we don't need to add it twice
	fs.readFile(timeout_txt, 'utf8', function(err, data) {
		if (err) throw err;
		if (data.includes(msg.author.id)) {
			return;
		}

		// Write it to the file
		var stream = fs.createWriteStream(timeout_txt, { flags: 'a' });
		stream.write(`${msg.author.id} ${date_thing} ${date.toLocaleTimeString()}\n`);
	});
}

// Setup the roletroll cron job to run: 00 * * * * *
// This runs every minute of every day of every day in the week of every week of every month of the year
let roletroll = new cron.CronJob('00 * * * * *', () => {
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
	const is_admin = msg.member.roles.cache.some(role => role.name === admin_rn);
	const is_muted = msg.member.roles.cache.some(role => role.name === mute_rn);

	// Initialize the guild variable so that we can get helpful information later
	// const guild = client.guilds.cache.get(server_id);

	if (is_muted) {
		msg.delete().catch(console.error);
	}

	// If a non-admin user sends a message that is 10 characters or less in a watched channel, mute them
	// if (msg.content.length <= minimum_message_length && channels_to_watch.includes(msg.channel.id) && !is_admin) {
	// 	customMuteUser(msg, guild, `<@${msg.author.id}> has been muted for sending messages that are ${minimum_message_length} characters or less`);
	// }

	// Delete messages with certain words: Open our text file and look for our ID
	fs.readFile(unaccepted_words_txt, 'utf8', function(err, data) {
		if (err) throw err;

		// Put each line as its own element in an array. Account for different line endings
		data = data.split(/\r?\n/);

		data.forEach(word => {
			// If message contains an unaccepted word and you are not an Admin, delete the message
			if (!msg.author.bot && msg.channel.type !== 'dm' && msg.content.toLowerCase().includes(word) && !is_admin) {
				msg.delete().catch(console.error);
			}
			// else if (!msg.author.bot && msg.channel.type !== 'dm' && msg.content.toLowerCase().includes(word)){
			// 	msg.author.send("Ayyyy, let's not use no-no words, m'kay?").catch(() => msg.reply(`I wasn't able to message you privately so I have to tell you this publically: Let's not use no-no words, m'kay?`));
			// }
		});
	});

	// ENABLE THIS IF YOU ADD CUSTOM COMMANDS
	// If this message isn't a command, or the user is a bot, or this is a DM: leave
	// if (!msg.content.startsWith(prefix) || msg.author.bot || msg.channel.type == 'dm') return;
});


// Slash commands
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	// The names of these are inherent to the interaction object, do not try to change them
	const { commandName, options } = interaction;

	is_admin = interaction.member.roles.cache.some(role => role.name === admin_rn)

	// If the user is not an admin, tell them that and do nothing
	if (!is_admin) {
		embed = new MessageEmbed()
                .setColor('RED')
                .setTitle('Incorrect Permissions')
				.setDescription(`You do not have the required permissions to run the ${commandName} command`)
                .setTimestamp()

		return interaction.reply({
			embeds: [embed],
			ephemeral: true, // Only the person running this command will see it
		});
	}

	// Must be an admin to perform any of the commands below

	// roletroll
	if (commandName === 'roletroll') {
		action = options.getString('action');
		is_start = action === 'start'
		is_start ? roletroll.start() : roletroll.stop();

		interaction.reply({
			content: `roletroll has been ${is_start ? 'started' : 'stopped'}`,
			ephemeral: true, // Only the person running this command will see it
		});
	}

	// modify-antispam
	else if (commandName === 'modify-antispam') {
		attribute = options.getString('attribute');
		attribute = attribute === 'more' ? options.getString('attribute-continued') : attribute;
		value = reformatAttributeValue(attribute, options.getString('value'));

		// Set the antispam variable to the modified Antispam object
		antispam = modifyAntispam(attribute, value);
		interaction.reply({
			content: `The *${attribute}* attribute has been changed to: *${value}*`,
			ephemeral: true, // Only the person running this command will see it
		});
	}

	// print-antispam-attribute
	else if (commandName === 'print-antispam-attribute') {
		attribute = options.getString('attribute');
		attribute = attribute === 'more' ? options.getString('attribute-continued') : attribute;
		value = antispam.getAttributeValue(attribute);
		
		interaction.reply({
			content: `The *${attribute}* attribute is currently set to: *${value}*`,
			ephemeral: true, // Only the person running this command will see it
		});
	}
});





// #####################################################################
// ############################# NOTES #################################
// #####################################################################

// Dependencies
// discord.js cron dotenv