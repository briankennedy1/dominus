Accounts.onCreateUser(function(options, user) {
	if (options.profile) {
		user.profile = options.profile;
	} else {
		user.profile = {};
	}

	// set admin
	user.admin = false;

	// if using a service to sign in put that email into user.emails
	// create username
	if (user.services) {
		if (user.services.google) {
			var email = user.services.google.email
			var verified = user.services.google.verified_email
			user.emails = [{address:email, verified:verified}]
			user.username = user.profile.name

			if (user.services.google.email == process.env.DOMINUS_ADMIN_EMAIL) {
				user.admin = true
			}
		}

		if (user.services.facebook) {
			var email = user.services.facebook.email
			user.emails = [{address:email, verified:true}]
			user.username = user.profile.name
		}
	}

	user.gold = s.starting_resources.gold
	user.grain = s.starting_resources.grain
	user.lumber = s.starting_resources.lumber
	user.ore = s.starting_resources.ore
	user.clay = s.starting_resources.clay
	user.glass = s.starting_resources.glass
	user.wool = s.starting_resources.wool
	user.created_at = new Date()
	user.lord = null
	user.vassals = []
	user.allies = []
	user.allies_below = []
	user.allies_above = []
	user.team = []
	user.siblings = []
	user.is_king = true
	user.is_dominus = false
	user.show_welcome_screen = true
	user.num_vassals = 0
	user.num_allies = 0
	user.num_allies_above = 0
	user.num_allies_below = 0
	user.res_update = {
		gold: 0,
		grain: 0,
		lumber: 0,
		ore: 0,
		wool: 0,
		clay: 0,
		glass: 0
	}
	user.lp_show_armies = true
	user.lp_show_lords = true
	user.lp_show_allies = true
	user.hex_scale = 1
	user.income = 0
	user.purchases = {
		castles: [s.castle.starting_image]
	}
	user.losses = {}
	user.losses_worth = 0
	user.losses_num = 0
	user.sp_show_coords = false
	user.sp_show_minimap = true

	// set game winner
	// xom from game 1
	if (user.emails && user.emails[0].address == 'hmliang@gmail.com') {
		user.is_game_winner = true
	}
	// hertle from game 2
	if (user.emails && user.emails[0].address == 'travel_on@hotmail.com') {
		user.is_game_winner = true
	}

	// if someone was dominus make them not dominus
	remove_dominus()

	return user
})


// check when user logs in if they have a castle
// if not then they are a new user
Accounts.onLogin(function(data) {
	if (data.user && !data.user.castle_id) {
		onCreateUser(data.user._id)
	}
})


onCreateUser = function(userId) {
	worker.enqueue('create_castle', {user_id: userId})
	init_dailystats_for_new_user(userId)
	setupEveryoneChatroom()
}


Meteor.startup(function() {
	Accounts.loginServiceConfiguration.remove({service:'google'})
	Accounts.loginServiceConfiguration.remove({service:'facebook'})
	Accounts.loginServiceConfiguration.insert(Meteor.settings.googleLogin)
	Accounts.loginServiceConfiguration.insert(Meteor.settings.facebookLogin)
})
