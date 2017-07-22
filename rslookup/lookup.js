(function() {
	var vm = this;
	vm.loadingCount = 0;
	vm.loadingControls = [];
	vm.rs3HiscoresApi = "http://services.runescape.com/m=hiscore/index_lite.ws?player=";

	document.addEventListener('DOMContentLoaded', function () {
		activate();
	});

	function activate() {
		registerLoadingControls();
		registerEvents();
	}

	function registerLoadingControls() {
		vm.loadingControls.push($('#input-user'));
	}

	function registerEvents() {
		$('#input-user').keyup(function(e) {
		    if(e.keyCode == 13) {
		    	enterPressed();
		    }
		});
	}

	function enterPressed() {
		var user = $('#input-user').val();
		if(!validUser(user)) {
			//TODO: Show validation error
			return;
		}

		getUser(user);
	}

	function validUser(user) {
		//TODO: Better validation?
		if(!user || user === "")
			return false;

		return true;
	}

	function getUser(user) {
		collapseSkillSection();
		incrementLoading();
		$.get(vm.rs3HiscoresApi + user, userReturned).fail(failedToRetrieveUser);
	}

	function userReturned(userString) {
		var user = mapUser(userString);

		decrementLoading();
		expandSkillSection(user);
		$('#input-user').select();
	}

	function failedToRetrieveUser() {
		decrementLoading();
		$('#input-user').select();
	}

	function incrementLoading() {
		vm.loadingCount++;

		if(vm.loadingCount == 1) {
			//If we've just begun loading, hide the loading controls
			hideLoadingControls();
		}
	}

	function decrementLoading() {
		vm.loadingCount--;

		if(vm.loadingCount == 0) {
			//If we've just finished loading, show the loading controls
			showLoadingControls();
		}
	}

	function expandSkillSection(user) {
		$('#skill-section').removeClass('collapsed');
		$('.skill-col').removeClass('collapsed');

		populateSkillSection(user);
	}

	function collapseSkillSection() {
		$('#skill-section').addClass('collapsed');
		$('.skill-col').addClass('collapsed');
	}

	function populateSkillSection(user) {
		log(user);
	}

	function showLoadingControls() {
		toggleLoadingControls(true);
	}

	function hideLoadingControls() {
		toggleLoadingControls(false);
	}

	function toggleLoadingControls(enabled) {
		for(var i = 0; i < vm.loadingControls.length; i++) {
			vm.loadingControls[i].prop('disabled', !enabled);
		}
	}

	function mapUser(userString) {
		var user = {
			stats: {
			}
		};

		var statNamesArray = [
			"overall",
			"attack",
			"defence",
			"strength",
			"constitution",
			"ranged",
			"prayer",
			"magic",
			"cooking",
			"woodcutting",
			"fletching",
			"fishing",
			"firemaking",
			"crafting",
			"smithing",
			"mining",
			"herblore",
			"agility",
			"thieving",
			"slayer",
			"farming",
			"runecrafting",
			"hunter",
			"construction",
			"summoning",
			"dungeoneering",
			"divination",
			"invention"
		];

		var userValues = userString.trim().split(/\s+/);

		if(userValues.length < statNamesArray.length) {
			throw "Expected user values to be at least the length of the statNamesArray";
		}

		for(var i = 0; i < statNamesArray.length; i++) {
			var statName = statNamesArray[i];
			var stat = userValues[i];
			var statFields = stat.split(',');

			user.stats[statName] = {};

			user.stats[statName].rank = statFields[0];
			user.stats[statName].level = statFields[1];
			user.stats[statName].experience = statFields[2];
		}

		return user;
	}

	function log(message) {
		if(window.console) {
			console.log(message);
		}
	}
})();
