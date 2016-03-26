var login = (function(lightdm) {
	var selected_user = null;
	var password = null;
	var $user = document.getElementById('user');
	var $pass = document.getElementById('pass');

	// private functions
	var setup_users_list = function() {
		var $list = $user;
		lightdm.users.forEach(function(user) {
			var $option = document.createElement('option');
			$option.value = user.name;
			$option.textContent = user.display_name;
			$list.appendChild($option);
		});
	};

	var select_user_from_list = function(idx) {
		var idx = idx || 0;

		find_and_display_user_picture(idx);

		if(lightdm._username){
			lightdm.cancel_authentication();
		}

		selected_user = lightdm.users[idx].name;
		if(selected_user !== null) {
			window.start_authentication(selected_user);
		}

		$pass.focus();
	};

	var find_and_display_user_picture = function(idx) {
		document.getElementById('profile-img').src = lightdm.users[idx].image;
	};

	// Functions that lightdm needs
	window.start_authentication = function(username) {
		lightdm.cancel_timed_login();
		lightdm.start_authentication(username);
	};
	window.provide_secret = function() {
		password = $pass.value || null;

		if(password !== null) {
			lightdm.provide_secret(password);
		}
	};
	window.authentication_complete = function() {
		if (lightdm.is_authenticated) {
			show_prompt('Logged in');
			lightdm.login(
				lightdm.authentication_user,
				lightdm.default_session
			);
		}
	};

	// These can be used for user feedback
	window.show_error = function(e) {
		console.log('Error: ' + e);

	};
	window.show_prompt = function(e) {
		console.log('Prompt: ' + e);
	};

	// exposed outside of the closure
	var init = function() {
		setup_users_list();
		select_user_from_list();

		$user.addEventListener('change', function(e) {
			e.preventDefault();
			var idx = e.currentTarget.selectedIndex;
			select_user_from_list(idx);
		});

		document.forms[0].addEventListener('submit', function(e) {
			e.preventDefault();
			window.provide_secret();
		});
	};

	return {
		init: init
	};
} (lightdm));

window.addEventListener('load', function() {
	login.init();
});
