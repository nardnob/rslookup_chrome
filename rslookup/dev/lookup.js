(function() {
	var vm = this;

	vm.loadingCount = 0;
	vm.loadingControls = [];
	vm.rs3HiscoresApi = "http://services.runescape.com/m=hiscore/index_lite.ws?player=";

	vm.apiSkills = [
		"total",
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
		"hunting",
		"construction",
		"summoning",
		"dungeoneering",
		"divination",
		"invention"
	];

	vm.userSkills = [
		"attack",
		"strength",
		"defence",
		"ranged",
		"prayer",
		"magic",
		"runecrafting",
		"construction",
		"dungeoneering",
		"constitution",
		"agility",
		"herblore",
		"thieving",
		"crafting",
		"fletching",
		"slayer",
		"hunting",
		"divination",
		"mining",
		"smithing",
		"fishing",
		"cooking",
		"firemaking",
		"woodcutting",
		"farming",
		"summoning"
	];

	///////////////////////////////////

	document.addEventListener('DOMContentLoaded', function () {
		activate();
	});

	function activate() {
		$('#input-user').focus();
		registerLoadingControls();
		registerEvents();
	}

	function registerLoadingControls() {
		vm.loadingControls.push($('#input-user'));
	}

	function registerEvents() {
		registerEnterEvent();
		registerMouseoverEvents();
	}

	function registerEnterEvent() {
		$('#input-user').keyup(function(e) {
		    if(e.keyCode == 13) {
		    	enterPressed();
		    }
		});
	}

	function registerMouseoverEvents() {
		for(var i = 0; i < vm.userSkills.length; i++) {
			$("#" + vm.userSkills[i]).mouseover(mouseoverSkill);
			$("#" + vm.userSkills[i]).mouseout(mouseoutSkill);
		}
	}

	function enterPressed() {
		var user = $('#input-user').val();
		if(!validUser(user)) {
			//TODO: Show validation error
			return;
		}

		getUser(user);
	}

	function mouseoverSkill() {
		//console.log("mouseoverSkill()");
		//console.log(this);
	}

	function mouseoutSkill() {
		//console.log("mouseoutSkill()");
		//console.log(this);
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
		//setTimeout(mockupUserReturned, 1000);
	}

	function mockupUserReturned(userString) {
		var user = mockupUser();
		log(user);

		decrementLoading();
		expandSkillSection(user);
		$('#input-user').select();
	}

	function userReturned(userString) {
		var user = parseUser(userString);
		getCombatLevels(user);
		log(user);

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
		populateTotalSummary(user)
	}

	function collapseSkillSection() {
		$('#skill-section').addClass('collapsed');
		$('.skill-col').addClass('collapsed');
	}

	function getCombatLevels(user) {
		var stats = user.stats;

		stats.combat = {
			level: calculateCombatLevel(user)
		};

		var f2pCombat = calculateCombatLevel(user, false);
		stats.f2pCombat = {
			level: f2pCombat
		};
	}

	function calculateCombatLevel(user, isMember = true) {
		//Combat formula: ((13/10) * max((Att + Str), 2Mag, 2Rng) + Def + Const + (1/2)Pray + (1/2)Summ) / 4
		var stats = user.stats;

		var meleeFactor = stats.attack.level + stats.strength.level;
		var magicFactor = 2 * stats.magic.level;
		var rangedFactor = 2 * stats.ranged.level;
		var offenciveFactor = Math.max(meleeFactor, magicFactor, rangedFactor);

		var defenceFactor = stats.defence.level;
		var constitutionFactor = stats.constitution.level;
		var prayerFactor = Math.floor(0.5 * stats.prayer.level);
		var summoningFactor = isMember ? Math.floor(0.5 * stats.summoning.level) : 0;
		var defenciveFactor = defenceFactor + constitutionFactor + prayerFactor + summoningFactor;

		var dividend = (13/10) * offenciveFactor + defenciveFactor;
		var divisor = 4;

		return Math.floor(dividend / divisor);
	}

	function populateSkillSection(user) {
		for(var i = 0; i < vm.userSkills.length; i++) {
			populateSkill(vm.userSkills[i], user);
		}
	}

	function populateSkill(skill, user) {
		var level = user.stats[skill].level.toString();
		var experience = user.stats[skill].experience.toString();

		$($('#' + skill + ' .skill-level')[0]).text(level);
		$('#' + skill).prop('title', "Exp: " + numberWithCommas(experience));
	}

	function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function populateTotalSummary(user) {
		var stats = user.stats;

		$("#total-level").text(stats.total.level.toString());
		$("#combat-level").text(stats.combat.level.toString());

		var f2pCombatDifference = stats.combat.level - stats.f2pCombat.level;
		if(f2pCombatDifference > 0) {
			var f2pCombatLevelString = " (" + stats.f2pCombat.level.toString() + " + " + f2pCombatDifference.toString() + ")";
			$("#f2p-combat-level").text(f2pCombatLevelString);
		} else {
			$("#f2p-combat-level").text("");
		}
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

	function parseUser(userString) {
		var user = {
			stats: {
			}
		};

		var userValues = userString.trim().split(/\s+/);

		if(userValues.length < vm.apiSkills.length) {
			throw "Expected user values to be at least the length of the vm.apiSkills";
		}

		for(var i = 0; i < vm.apiSkills.length; i++) {
			var statName = vm.apiSkills[i];
			var stat = userValues[i];
			var statFields = stat.split(',');

			user.stats[statName] = {};

			user.stats[statName].rank = parseInt(statFields[0]);
			user.stats[statName].level = parseInt(statFields[1]);
			user.stats[statName].experience = parseInt(statFields[2]);
		}

		return user;
	}

	function mockupUser() {
		var user = {
			stats: {
			}
		};

		for(var i = 0; i < vm.apiSkills.length; i++) {
			var statName = vm.apiSkills[i];

			user.stats[statName] = {};

			user.stats[statName].rank = 1000;
			user.stats[statName].level = i;
			user.stats[statName].experience = 14000000;
		}

		return user;
	}

	function log(message) {
		if(window.console) {
			console.log(message);
		}
	}
})();
