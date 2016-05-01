/*
	Mock data for testing your LightDM theme in the browser
*/
if (!('lightdm' in window)) {
	window.lightdm = {};
	lightdm.hostname ='test-host';
	lightdm.languages = [{
		code: 'en_US',
		name: 'English(US)',
		territory: 'USA'
	}, {
		code: 'en_UK',
		name: 'English(UK)',
		territory: 'UK'
	}];
	lightdm.default_language = lightdm.languages[0];
	lightdm.layouts = [{
		name: 'test',
		short_description: 'test description',
		description: 'really long epic description'
	}];
	lightdm.default_layout = lightdm.layouts[0];
	lightdm.layout = lightdm.layouts[0];
	lightdm.sessions = [{
		key: 'gnome',
		name: 'Gnome',
		comment: 'no comment'
	}, {
		key: 'gnome-wayland',
		name: 'Gnome Wayland',
		comment: 'no comment'
	}];

	lightdm.default_session = lightdm.sessions[0]['key'];
	lightdm.authentication_user = null;
	lightdm.is_authenticated = false;
	lightdm.can_suspend = true;
	lightdm.can_hibernate = true;
	lightdm.can_restart = true;
	lightdm.can_shutdown = true;
	lightdm.awaiting_username = false;

	lightdm.users = [{
		name: 'synaptiko',
		real_name: 'Superman',
		display_name: 'Jiří Prokop',
		image: 'http://www.gravatar.com/avatar/7f405a13d2b6a516b2edae07d7483f94.png',
		language: 'en_US',
		layout: null,
		session: 'gnome',
		logged_in: false
	}, {
		name: 'brucew',
		real_name: 'Batman',
		display_name: 'Bruce Wayne',
		image: 'http://uk.omg.li/VDHr/OW-blog-Batman.jpg',
		language: 'en_US',
		layout: null,
		session: 'gnome',
		logged_in: false
	}, {
		name: 'peterp',
		real_name:'Spiderman',
		display_name: 'Peter Parker',
		image: '/nothing',
		language: 'en_US',
		layout: null,
		session: 'gnome-wayland',
		logged_in: true
	}];

	lightdm.num_users = lightdm.users.length;
	lightdm.timed_login_delay = 0; // increase to simulate timed_login_delay
	lightdm.timed_login_user = (lightdm.timed_login_delay > 0 ? lightdm.users[0] : null);

	lightdm.get_string_property = function () {};
	lightdm.get_integer_property = function () {};
	lightdm.get_boolean_property = function () {};
	lightdm.cancel_timed_login = function () {
		_lightdm_mock_check_argument_length(arguments, 0);

		lightdm._timed_login_cancelled= true;
	};

	lightdm.provide_secret = function (secret) {
		if (typeof lightdm._username == 'undefined' || !lightdm._username) {
			throw 'must call start_authentication first'
		}
		_lightdm_mock_check_argument_length(arguments, 1);

		var user = _lightdm_mock_get_user(lightdm.username);

		if (!user && secret === lightdm._username) {
			lightdm.is_authenticated = true;
			lightdm.authentication_user = user;
		}
		else {
			lightdm.is_authenticated = false;
			lightdm.authentication_user = null;
			lightdm._username = null;
		}

		authentication_complete();
	};

	lightdm.start_authentication = function (username) {
		if (typeof username === 'undefined') {
			show_prompt('Username?', 'text');
			lightdm.awaiting_username = true;
			return;
		}
		_lightdm_mock_check_argument_length( arguments, 1 );
		if (lightdm._username) {
			throw 'Already authenticating!';
		}
		var user = _lightdm_mock_get_user(username);
		if (!user) {
			show_error(username + ' is an invalid user');
		}
		show_prompt('Password: ');
		lightdm._username = username;
	};

	lightdm.cancel_authentication = function () {
		_lightdm_mock_check_argument_length(arguments, 0);

		if (!lightdm._username) {
			throw 'we are not authenticating';
		}
		lightdm._username = null;
	};

	lightdm.suspend = function () {
		alert('System Suspended. Bye Bye');
		document.location.reload(true);
	};

	lightdm.hibernate = function () {
		alert('System Hibernated. Bye Bye');
		document.location.reload(true);
	};

	lightdm.restart = function () {
		alert('System restart. Bye Bye');
		document.location.reload(true);
	};

	lightdm.shutdown = function () {
		alert('System Shutdown. Bye Bye');
		document.location.reload(true);
	};

	lightdm.login = function (user, session) {
		_lightdm_mock_check_argument_length(arguments, 2);

		if (!lightdm.is_authenticated) {
			throw 'The system is not authenticated';
		}
		if (user !== lightdm.authentication_user) {
			throw 'this user is not authenticated';
		}

		alert('logged in successfully!!');
		document.location.reload(true);
	};

	lightdm.authenticate = function(session) {
		lightdm.login(null, session);
	};

	lightdm.respond = function(response) {
		if (lightdm.awaiting_username) {
			lightdm.awaiting_username = false;
			lightdm.start_authentication(response);
		}
		else {
			lightdm.provide_secret(response);
		}
	};

	lightdm.start_session_sync = function() {
		lightdm.login(null, null);
	};

	if (lightdm.timed_login_delay > 0) {
		setTimeout(
			function () {
				if (!lightdm._timed_login_cancelled()) timed_login();
			},
			lightdm.timed_login_delay
		);
	}

	var
		config = {},
		greeterutil = {};

	config.get_str = function(section, key) {
		var branding = {
			logo: 'img/arch.png',
			background_image: 'file:///usr/share/lightdm-webkit/theme/antergos/img/fallback_bg.jpg'
		};
		if (section === 'branding') {
			return branding[key];
		}
	};
	config.get_bool = function(section, key) {
		return true;
	};

	greeterutil.dirlist = function(directory) {
		return [];
	};
}

// Helper functions
function _lightdm_mock_check_argument_length(args, length) {
	if (args.length != length) {
		throw 'incorrect number of arguments in function call';
	}
}

function _lightdm_mock_get_user(username) {
	var user = null;
	for (var i = 0; i < lightdm.users.length; ++ i) {
		if (lightdm.users[i].name == username) {
			user = lightdm.users[i];
			break;
		}
	}
	return user;
}
