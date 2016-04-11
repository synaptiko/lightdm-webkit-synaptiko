var
	wallpaperIdx = 0,
	activeContainer = 'clock',
	profileImages = [],
	$wrapper = document.getElementById('wrapper'),
	$card = document.getElementById('card'),
	$clockContainer = document.getElementById('clockContainer'),
	$loginContainer = document.getElementById('loginContainer'),
	$loginForm = document.getElementById('loginForm'),
	$users = document.getElementById('users'),
	$password = document.getElementById('password'),
	$profileImage = document.getElementById('profileImage');

function setupUserList() {
	lightdm.users.forEach(function(user, idx) {
		var $option = document.createElement('option');
		$option.value = user.name;
		$option.textContent = user.display_name;
		$users.appendChild($option);

		profileImages[idx] = false;
		waitForImage(user.image, function() {
			profileImages[idx] = user.image;
		});
	});
}

function selectUserFromList(idx) {
	var
		profileImageSrc = profileImages[idx],
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

function waitForImage(url, callback) {
	var image = new Image();
	image.addEventListener('load', callback);
	image.src = url;
}

function setWallpaperIdx(idx, callback) {
	var imageUrl = './assets/wallpaper/wallpaper' + idx + '.jpg';

	wallpaperIdx = idx;
	$wrapper.style.backgroundImage = 'url(' + imageUrl + ')';
	localStorage.setItem('synaptiko:wallpaperIdx', idx);

	if (callback) {
		waitForImage(imageUrl, callbackUntilTimeout(callback, 1000));
	}
}

function callbackUntilTimeout(callback, timeout) {
	var
		resolved = false,
		timeoutId = setTimeout(resolver, timeout);

	function resolver() {
		if (!resolved) {
			resolved = true;
			if (timeoutId !== false) {
				clearTimeout(timeoutId);
				timeoutId = false;
			}
			callback();
		}
	}
	return resolver;
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

	if (container === 'clock') {
		resetPasswordField();
	}
	else { // container === 'login'
		selectUserFromList($users.selectedIndex);
		resetPasswordField();
	}
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
	setWallpaperIdx(parseInt(localStorage.getItem('synaptiko:wallpaperIdx'), 10) || 0, function() {
		$wrapper.classList.add('in');
		// fade the card in
		setTimeout(function() {
			$card.classList.add('in');
		}, 500);
	});
	setupUserList();
	selectUserFromList(0);
	$users.addEventListener('change', onUsersChange);
	$card.addEventListener('click', onCardClick);
	$clockContainer.addEventListener('transitionend', onTransitionEnd);
	$loginContainer.addEventListener('transitionend', onTransitionEnd);
	document.body.addEventListener('keyup', onBodyKeyUp);
	$loginForm.addEventListener('submit', onLoginFormSubmit);
}());
