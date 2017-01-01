var
	activeContainer = 'clock',
	profileImages = [],
	$wrapper = document.getElementById('wrapper'),
	$logoContainer = document.getElementById('logoContainer'),
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
		$profileImage.style.backgroundImage = `url(${profileImageSrc})`;
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

function setWallpaper(callback) {
	var backgroundImagesDir = config.get_str('branding', 'background_images') || '/usr/share/backgrounds'
	var images = theme_utils.dirlist(backgroundImagesDir);
	var imageUrl = images[0];

	if (imageUrl) {
		if (callback) {
			waitForImage(imageUrl, callbackUntilTimeout(callback, 1000));
		}
		$wrapper.style.backgroundImage = `url(${imageUrl})`;
	}
	else {
		callback();
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
	setContainerVisible($clockContainer, (container === 'clock'));
	setContainerVisible($loginContainer, (container === 'login'));

	$logoContainer.classList[container === 'clock' ? 'add' : 'remove']('footer');
	$logoContainer.classList[container === 'login' ? 'add' : 'remove']('header');

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

function onScreenClick(e) {
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
	if (activeContainer === 'clock' && e.keyCode === 13) { // Enter
		e.preventDefault();
		e.stopPropagation();
		switchToContainer('login');
	}
	else if (activeContainer === 'login' && e.keyCode === 27) { // ESC
		switchToContainer('clock');
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
			$password.classList.add('invalid');
			$password.select();
		}
	};

	window.show_error = function() {};

	window.show_prompt = function() {};
}());

(function init() {
	setWallpaper(function() {
		$wrapper.classList.add('in');
		setTimeout(function() {
			$clockContainer.classList.add('in');
			$clockContainer.addEventListener('transitionend', function initialClockContainerFadeIn() {
				$clockContainer.classList.add('up');
				$clockContainer.removeEventListener('transitionend', initialClockContainerFadeIn);
			});
		}, 500);
	});
	setupUserList();
	selectUserFromList(0);
	$users.addEventListener('change', onUsersChange);
	$clockContainer.addEventListener('transitionend', onTransitionEnd);
	$loginContainer.addEventListener('transitionend', onTransitionEnd);
	document.body.addEventListener('click', onScreenClick);
	document.body.addEventListener('keyup', onBodyKeyUp);
	$loginForm.addEventListener('submit', onLoginFormSubmit);
}());
