var
	wallpaperIdx = 0,
	activeContainer = 'clock',
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

function setWallpaperIdx(idx) {
	wallpaperIdx = idx;
	document.body.style.backgroundImage = 'url(./assets/wallpaper/wallpaper' + idx + '.jpg)';
	localStorage.setItem('synaptiko:wallpaperIdx', idx);
}

function setContainerVisible($container, visible) {
	$container.classList[visible ? 'add' : 'remove']('in');
	$container.classList[!visible ? 'add' : 'remove']('hidden');
}

function switchToContainer(container) {
	activeContainer = container;
	$card.classList[(container === 'clock') ? 'add' : 'remove']('clickable');
	setContainerVisible($clockContainer, (container === 'clock'));
	setContainerVisible($loginContainer, (container === 'login'));
}

function resetPasswordField(options) {
	options = options || {};
	$password.classList.remove('invalid');
	if (!options.preserveValue) {
		$password.value = '';
	}
}

function onUsersChange(e) {
	e.preventDefault();
	selectUserFromList(e.currentTarget.selectedIndex);
	resetPasswordField();
}

function onCardClick(e) {
	e.preventDefault();
	if (activeContainer === 'clock') {
		switchToContainer('login');
	}
}

function onTransitionEnd(e) {
	var target = e.target;
	if (target === e.currentTarget && !target.classList.contains('in')) {
		target.classList.add('hidden');
		if (activeContainer === 'login') {
			$password.focus();
		}
	}
}

function onBodyKeyUp(e) {
	var newWallpaperIdx;

	if (activeContainer === 'clock' && e.keyCode === 13) { // Enter
		e.preventDefault();
		e.stopPropagation();
		switchToContainer('login');
	}
	else if (activeContainer === 'login' && e.keyCode === 27) { // ESC
		resetPasswordField();
		switchToContainer('clock');
	}
	else if (e.altKey && [37, 39].indexOf(e.keyCode) !== -1) { // Alt + Arrow Left/Right
		newWallpaperIdx = wallpaperIdx + (e.keyCode === 37 ? -1 : +1);
		newWallpaperIdx = (newWallpaperIdx < 0 ? 3 : (newWallpaperIdx % 4));
		setWallpaperIdx(newWallpaperIdx);
	}
}

function onLoginFormSubmit(e) {
	e.preventDefault();
	resetPasswordField({ preserveValue: true });
	window.provide_secret();
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
			resetPasswordField({ preserveValue: true });
			$password.select();
		}
	};

	window.show_error = function() {};

	window.show_prompt = function() {};
}());

(function init() {
	setWallpaperIdx(parseInt(localStorage.getItem('synaptiko:wallpaperIdx'), 10) || 0);
	setupUserList();
	selectUserFromList(0);
	// fade the card in
	setTimeout(function() {
		$card.classList.add('in');
	}, 500);
	$users.addEventListener('change', onUsersChange);
	$card.addEventListener('click', onCardClick);
	$clockContainer.addEventListener('transitionend', onTransitionEnd);
	$loginContainer.addEventListener('transitionend', onTransitionEnd);
	document.body.addEventListener('keyup', onBodyKeyUp);
	$loginForm.addEventListener('submit', onLoginFormSubmit);
}());
