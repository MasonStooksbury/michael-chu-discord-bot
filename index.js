require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


const TOKEN = process.env.TOKEN;
const prefix = process.env.PREFIX;
const server_id = process.env.SERVER_ID;
const mute_rn = process.env.MUTE_RN;
const admin_rn = process.env.ADMIN_RN;

// Dependencies
const fs = require('fs');
const cron = require('cron');

// Files
const timeout_txt = './timeout.txt';

// Invite Link


client.login(TOKEN);

// When the bot connects
client.on('ready', () => {
	console.info(`Logged in as ${client.user.tag}!`);
});



// Setup the roletroll cron job to run: 00 * * * * *
// This runs every minute of every day of the month of every month for every day of the week
// let roletroll = new cron.CronJob('00 * * * * *', () => {
// 	// Check our ban list
// 	fs.readFile(temp_roles_txt, 'utf8', function(err, data) {
// 		// If we find any problems, explode
// 		if (err) throw err;

// 		// Split up the data so that each line is an element in this array
// 		let lines = data.split(/\r?\n/);
// 		// Create a dictionary so that we can store the user ID with the date to remove the role
// 		let dict = {};

// 		// Loop thru the array, split up the line, and put it into the dictionary as a key/value pair
// 		lines.forEach(line => {
// 			const pieces = line.split(' ');
// 			// Split out all the pieces into what they should be and initialized with default values
// 			user = pieces[0] == undefined ? '' : pieces[0];
// 			role = pieces[1] == undefined ? '' : pieces[1];
// 			date = pieces[2] == undefined ? '' : pieces[2];
// 			time = pieces[3] == undefined ? '' : `${pieces[3]} ${pieces[4]}`;

// 			// Save everything into the dictionary
// 			dict[user] = {
// 				'user': user,
// 				'role': role,
// 				'date': date,
// 				'time': time,
// 			}
// 		})

// 		// Create a list of people to remove roles from if it is their time
// 		let people_to_yeet_role_from = [];
// 		let the_broken = [];
// 		for (let key in dict) {
// 			// Change the time
// 			// The "toLocaleString()" looks like this: 3/20/2021, 9:12:16 PM (with some other garbage, but this is what we care about)
// 			if (dict[key]['date'] === new Date(Date.now()).toLocaleString().split(', ')[0] &&
// 				dict[key]['time'].split(':')[0] === new Date(Date.now()).toLocaleString().split(', ')[1].split(':')[0] &&
// 				dict[key]['time'].split(':')[1] === new Date(Date.now()).toLocaleString().split(', ')[1].split(':')[1] &&
// 				dict[key]['time'].split(' ')[1] === new Date(Date.now()).toLocaleString().split(', ')[1].split(' ')[1]) {
// 				people_to_yeet_role_from.push(
// 					{
// 						'user': dict[key],
// 						'role': dict[key]['role']
// 					});
// 				delete dict[key];
// 			} else if (key === '' && dict[key] === '') {
// 				console.log('Weird case in roletroll: Ignore.');
// 			} else if (dict[key] === '') {
// 				the_broken.push(key);
// 			}
// 		}
		

// 		if (people_to_yeet_role_from.length >= 1) {
// 			people_to_yeet_role_from.forEach(person => {
// 				// Get the Guild and store it under the variable "guild"
// 				const guild = client.guilds.cache.get(server_id);
				
// 				// Get the role object
// 				const role_object = guild.roles.cache.find(roles => roles.name === person['role']);
			
// 				// Grab the member we are looking for and remove their role
// 				guild.members.fetch(person['user']['user'])
// 				.then((user) => {
// 					// Remove the person's role
// 					user.roles.remove(role_object).catch(() => {
// 						console.log('Role could not be removed');
// 					})
// 				});
// 			});
// 		}

// 		// Here is why we are doing streams rather than appendFile or appendFileSync:
// 		// https://stackoverflow.com/questions/3459476/how-to-append-to-a-file-in-node/43370201#43370201

// 		// Write every entry back to the file
// 		var stream = fs.createWriteStream('temp_roles.txt', { flags: 'w' });
// 		for (let key in dict) {
// 			stream.write(`${dict[key]['user']} ${dict[key]['role']} ${dict[key]['date']} ${dict[key]['time']}\n`);
// 		}
// 	});
// });

// Start up the roletroll by default (you can stop it with the subsequent command at the bottom)
// roletroll.start();



const AntiSpam = require('discord-anti-spam');
const antiSpam = new AntiSpam({
	// All of these options are found under the AntiSpamClientOptions section here: https://discord-anti-spam.js.org/global.html
	warnThreshold: 2, // Amount of messages sent in a row that will cause a warning.
	kickThreshold: 10, // Amount of messages sent in a row that will cause a kick.
	muteThreshold: 2, // Amount of messages sent in a row that will cause a mute
	banThreshold: 10, // Amount of messages sent in a row that will cause a ban.
	maxInterval: 5000, // Amount of time (in milliseconds) in which messages are considered spam.
	maxDuplicatesInterval: '', // Amount of time (ms) in which duplicate messages are considered spam.
	maxDuplicatesWarn: 2, // Amount of duplicate messages that trigger a warning.
	maxDuplicatesKick: 10, // Amount of duplicate messages that trigger a warning.
	maxDuplicatesMute: 2, // Ammount of duplicate message that trigger a mute.
	maxDuplicatesBan: 12, // Amount of duplicate messages that trigger a warning.
	muteRoleName: "Muted", // Name of the role that will be given to muted users!
	modLogsChannelName: '', // Name or ID of the channel in which moderation logs will be sent.
	modLogsEnabled: '', // Whether moderation logs are enabled.
	warnMessage: '{@user}, Please stop spamming.', // Message that will be sent in chat upon warning a user.
	kickMessage: '**{user_tag}** has been kicked for spamming.', // Message that will be sent in chat upon kicking a user.
	muteMessage: '**{user_tag}** has been muted for spamming.',// Message that will be sent in chat upon muting a user.
	banMessage: '**{user_tag}** has been banned for spamming.', // Message that will be sent in chat upon banning a user.
	errorMessages: true, // Whether the bot should send a message in the channel when it doesn't have some required permissions, like it can't kick members.
	kickErrorMessage: true, // Message that will be sent in the channel when the bot doesn't have enough permissions to kick the member.
	muteErrorMessage: true, // Message that will be sent in the channel when the bot doesn't have enough permissions to mute the member (to add the mute role).
	banErrorMessage: true, // Message that will be sent in the channel when the bot doesn't have enough permissions to ban the member.
	ignoredMembers: [], // Array of member IDs that are ignored.
	ignoredRoles: '', // Array of role IDs or role names that are ignored. Members with one of these roles will be ignored.
	ignoredGuilds: '', // Array of guild IDs or guild names that are ignored.
	ignoredChannels: '', // Array of channel IDs or channel names that are ignored.
	ignoredPermissions: [ 'Admin' ], // TODO: Ask Lewis what to set this to // Bypass users with any of these permissions.
	ignoreBots: true, // Whether bots should be ignored.
	warnEnabled: true, // Whether warn sanction is enabled.
	kickEnabled: true, // Whether kick sanction is enabled.
	muteEnabled: true, // Whether mute sanction is enabled.
	banEnabled: true, // Whether ban sanction is enabled.
	deleteMessagesAfterBanForPastDays: '', // TODO: Ask Lewis what to set this to // When a user is banned, their messages sent in the last x days will be deleted.
	verbose: true, // Extended logs from module (recommended).
	debug: true, // Whether to run the module in debug mode.
	removeMessages: true, // If the bot should remove all the spam messages when taking action on a user!
	removeBotMessages: '', // TODO: Ask Lewis what to set this to // Whether to delete bot messages after an time.
	removeBotMessagesAfter: '' // TODO: Ask Lewis what to set this to // Whenever to delete bot messages. IN MILLISECONDS
});


// When the bot detects that the message has been sent
client.on('messageCreate', msg => {
	// Initialize the guild variable so that we can get helpful information later
	const guild = client.guilds.cache.get(server_id);

	// If a user sends a message that is 10 characters or less, mute them for 10 minutes
	if (msg.content.length <= 10) {
		console.log('in here');
		//TODO: Mute for 10 mintues
		// First, assign them the mute role if they don't already have it
		if (!msg.member.roles.cache.some(role => role.name === mute_rn)) {
			// Grab the actual role object
			var role = guild.roles.cache.find(role => role.name === mute_rn);
			// Assign the role object to our person
			msg.member.roles.add(role);
			msg.channel.send(`<@${msg.author.id}> has been muted for sending messages that are 10 characters or less`);
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

	// If this isn't a command, or the user is a bot, or this is a DM: leave
	if (!msg.content.startsWith(prefix) || msg.author.bot || msg.channel.type == 'dm') return;

	// whitelist-user
	// Only Admins can do this
	if (msg.content.startsWith(prefix + 'whitelist-user') && msg.member.roles.cache.some(role => role.name === admin_rn)) {
		// Grab whoever is mentioned in the command
		const person = msg.mentions.members.first();

		// If they are already whitelisted, let the user know
		if (msg.member.roles.cache.some(role => role.name === whitelist_rn)) {
			msg.channel.send(`<@${person.user.id}> is already whitelisted.`);
		}
		// Else, whitelist them
		else {
			// Grab the actual role object
			var role = guild.roles.cache.find(role => role.name === whitelist_rn);
			// Assign the role object to our person
			msg.member.roles.add(role);
			msg.channel.send(`<@${person.user.id}> has been successfully whitelisted!`);
		}
		sleep().then(() => {
			msg.delete();
		});
	}

	// unwhitelist-user
	// Only Admins can do this
	else if (msg.content.startsWith(prefix + 'unwhitelist-user') && msg.member.roles.cache.some(role => role.name === admin_rn)) {
		// Grab whoever is mentioned in the command
		let person = msg.mentions.members.first();

		// If they are already unmuted, let the muter know
		if (!msg.member.roles.cache.some(role => role.name === whitelist_rn)) {
			msg.channel.send(`<@${person.user.id}> is not whitelisted.`);
		}
		// Else, unwhitelist them
		else {
			// Grab the actual role object
			var role = guild.roles.cache.find(role => role.name === whitelist_rn);
			// Assign the role object to our person
			msg.member.roles.remove(role);
			msg.channel.send(`<@${person.user.id}> has been successfully removed from the whitelist!`);
		}
		sleep().then(() => {
			msg.delete();
		});
	}

	// roletroll commands
	else if (msg.content.startsWith(prefix + 'roletroll') && member.roles.cache.some(role => role.name === admin_rn)) {
		if (msg.content.slice(prefix.length + 'roletroll '.length) === 'start') {
			roletroll.start();
		} else {
			roletroll.stop();
		}
	}
});





//###############
// NOTES
//###############

// Invite Link: https://discord.com/api/oauth2/authorize?client_id=941547226986070057&permissions=8&scope=bot


// Questions
// How high will the time go for muting? 30 minutes? Hours? Days?
//


// Installs
// discordjs cron dotenv discord-anti-spam