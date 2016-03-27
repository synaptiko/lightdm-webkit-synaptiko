var
	wallpaperIdx = 0,
	$card = document.getElementById('card'),
	$clockContainer = document.getElementById('clockContainer'),
	$loginContainer = document.getElementById('loginContainer'),
	$loginForm = document.getElementById('loginForm'),
	$users = document.getElementById('users'),
	$password = document.getElementById('password'),
	$profileImage = document.getElementById('profileImage');

function setupUserList() {
	lightdm.users.forEach(function(user) {
		var $option = document.createElement('option');
		$option.value = user.name;
		$option.textContent = user.display_name;
		$users.appendChild($option);
	});
}

function selectUserFromList(idx) {
	var
		profileImageSrc = lightdm.users[idx].image,
		selectedUser;

	if (profileImageSrc) {
		$profileImage.classList.remove('unknown');
		$profileImage.style.backgroundImage = 'url(' + profileImageSrc + ')';
	}
	else {
		$profileImage.classList.add('unknown');
		$profileImage.style.backgroundImage = null;
	}

	if (lightdm._username){
		lightdm.cancel_authentication();
	}

	selectedUser = lightdm.users[idx].name;
	if (selectedUser) {
		window.start_authentication(selectedUser);
	}
}

function setClockContainerVisible(visible) { // TODO jprokop: rename it
	$card.classList[visible ? 'add' : 'remove']('clickable');
	$clockContainer.classList[!visible ? 'add' : 'remove']('hidden');
	$clockContainer.classList[visible ? 'add' : 'remove']('in');
	$loginContainer.classList[visible ? 'add' : 'remove']('hidden');
	$loginContainer.classList[!visible ? 'add' : 'remove']('in');
}

function onTransitionEnd(e) {
	var target = e.target;
	if (target === e.currentTarget && !target.classList.contains('in')) {
		target.classList.add('hidden');
		$password.focus(); // TODO jprokop: solve it better way!
	}
}

(function initLightdmApi() {
	window.start_authentication = function(username) {
		lightdm.cancel_timed_login();
		lightdm.start_authentication(username);
	};

	window.provide_secret = function() {
		var password = $password.value;
		if (password) {
			lightdm.provide_secret(password);
		}
	};

	window.authentication_complete = function() {
		if (lightdm.is_authenticated) {
			lightdm.login(
				lightdm.authentication_user,
				lightdm.default_session
			);
		}
		else {
			window.start_authentication($users.value);
			$password.classList.add('invalid'); // TODO jprokop: wrap to some function?
			$password.select();
		}
	};

	window.show_error = function() {};

	window.show_prompt = function() {};
}());

(function init() {
	setupUserList();
	selectUserFromList(0);

	setTimeout(function() {
		$card.classList.add('in');
	}, 500);

	$users.addEventListener('change', function(e) { // TODO jprokop: wrap to some function?
		e.preventDefault();
		selectUserFromList(e.currentTarget.selectedIndex);
		$password.value = '';
		$password.classList.remove('invalid');
	});

	$card.addEventListener('click', function(e) { // TODO jprokop: wrap to some function?
		e.preventDefault();
		setClockContainerVisible(false);
	});

	$clockContainer.addEventListener('transitionend', onTransitionEnd);
	$loginContainer.addEventListener('transitionend', onTransitionEnd);

	document.body.addEventListener('keyup', function(e) { // TODO jprokop: wrap to some function?
		if (e.keyCode === 13) {
			e.preventDefault();
			e.stopPropagation();
			setClockContainerVisible(false);
		}
		else if (e.keyCode === 27) {
			setClockContainerVisible(true);
			$password.value = '';
			$password.classList.remove('invalid');
		}
		else if (e.ctrlKey && [37, 39].indexOf(e.keyCode) !== -1) {
			wallpaperIdx += (e.keyCode === 37 ? -1 : +1);
			if (wallpaperIdx < 0) wallpaperIdx = 6;
			wallpaperIdx = (wallpaperIdx % 7);
			document.body.style.backgroundImage = 'url(./assets/wallpaper/wallpaper' + wallpaperIdx + '.jpg)';
		}
	});

	$loginForm.addEventListener('submit', function(e) { // TODO jprokop: wrap to some function?
		e.preventDefault();
		$password.classList.remove('invalid');
		window.provide_secret();
	});

}());
