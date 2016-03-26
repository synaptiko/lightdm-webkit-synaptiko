function updateTime() {
	var now = new Date();
	var hours = now.getHours();
	var minutes = now.getMinutes();

	minutes = (((minutes < 10) ? '0' : '') + minutes);
	document.getElementById('clock').textContent = (hours + ':' + minutes);
}

window.addEventListener('load', function() {
	setInterval(updateTime, 500);
});
