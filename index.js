require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Invite Link (Admin permission): https://discord.com/api/oauth2/authorize?client_id=941547226986070057&permissions=8&scope=bot

// Dependencies
const fs = require('fs');
const cron = require('cron');
const AntiSpam = require('discord-anti-spam');

// Files
const timeout_txt = './timeout.txt';



client.login(TOKEN);

// When the bot connects
client.on('ready', () => {
	console.info(`Logged in as ${client.user.tag}!`);
});





// #####################################################################
// ################ FUNCTIONS and GLOBAL VARIABLES #####################
// #####################################################################

const TOKEN = process.env.TOKEN;
const prefix = process.env.PREFIX;
const server_id = process.env.SERVER_ID;
const mute_rn = process.env.MUTE_RN;
const admin_rn = process.env.ADMIN_RN;
let minimum_message_length = parseInt(process.env.MIN_MESSAGE_LENGTH);

// Message a specific user. Mainly used in the Major Events logs
function modifyAntispam(attribute=false, value=false) {
	antispam_object = {
		// All of these options are found under the AntiSpamClientOptions section here: https://discord-anti-spam.js.org/global.html
		muteThreshold: 3, // Amount of messages sent in a row that will cause a mute
		maxInterval: 60000, // Amount of time (in milliseconds) in which messages are considered spam.
		maxDuplicatesInterval: 60000, // Amount of time (ms) in which duplicate messages are considered spam.
		maxDuplicatesWarn: 5, // Amount of duplicate messages that trigger a warning.
		maxDuplicatesKick: 5, // Amount of duplicate messages that trigger a warning.
		maxDuplicatesMute: 2, // Ammount of duplicate message that trigger a mute.
		maxDuplicatesBan: 5, // Amount of duplicate messages that trigger a warning.
		unMuteTime: 2, // Time in minutes to wait until unmuting a user.
		modLogsChannelName: '', // Name or ID of the channel in which moderation logs will be sent.
		modLogsEnabled: '', // Whether moderation logs are enabled.
		muteMessage: '**{user_tag}** has been muted for spamming.',// Message that will be sent in chat upon muting a user.
		errorMessages: true, // Whether the bot should send a message in the channel when it doesn't have some required permissions, like it can't kick members.
		muteErrorMessage: true, // Message that will be sent in the channel when the bot doesn't have enough permissions to mute the member (to add the mute role).
		ignoredMembers: [], // Array of member IDs that are ignored.
		ignoredRoles: '', // Array of role IDs or role names that are ignored. Members with one of these roles will be ignored.
		ignoredGuilds: '', // Array of guild IDs or guild names that are ignored.
		ignoredChannels: '', // Array of channel IDs or channel names that are ignored.
		ignoredPermissions: [], // Bypass users with any of these permissions.
		ignoreBots: true, // Whether bots should be ignored.
		warnEnabled: false, // Whether warn sanction is enabled.
		kickEnabled: false, // Whether kick sanction is enabled.
		muteEnabled: true, // Whether mute sanction is enabled.
		banEnabled: false, // Whether ban sanction is enabled.
		verbose: true, // Extended logs from module (recommended).
		debug: true, // Whether to run the module in debug mode.
		removeMessages: true, // If the bot should remove all the spam messages when taking action on a user!
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
			msg.channel.send(`<@${msg.author.id}> has been muted for sending messages that are 10 characters or less`);
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

	// roletroll commands
	// Only Admins can do this
	else if (msg.content.startsWith(prefix + 'roletroll') && isAdmin) {
		msg.content.slice(prefix.length + 'roletroll '.length) === 'start' ? roletroll.start() : roletroll.stop();
	}
});





// #####################################################################
// ############################# NOTES #################################
// #####################################################################

// TODOS
// Reset index.js for discord-anti-spam

// Dependencies
// discordjs cron dotenv discord-anti-spam