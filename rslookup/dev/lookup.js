(function() {
	var vm = this;
	vm.loadingCount = 0;
	vm.loadingControls = [];
	vm.rs3HiscoresApi = "http://services.runescape.com/m=hiscore/index_lite.ws?player=";

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
		populateSummary(user)
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
		//((13/10) * max((Att + Str), 2Mag, 2Rng) + Def + Const + (1/2)Pray + (1/2)Summ) / 4
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
		populateSkill("attack", user);
		populateSkill("strength", user);
		populateSkill("defence", user);
		populateSkill("ranged", user);
		populateSkill("prayer", user);
		populateSkill("magic", user);
		populateSkill("runecrafting", user);
		populateSkill("construction", user);
		populateSkill("dungeoneering", user);
		populateSkill("constitution", user);
		populateSkill("agility", user);
		populateSkill("herblore", user);
		populateSkill("thieving", user);
		populateSkill("crafting", user);
		populateSkill("fletching", user);
		populateSkill("slayer", user);
		populateSkill("hunting", user);
		populateSkill("divination", user);
		populateSkill("mining", user);
		populateSkill("smithing", user);
		populateSkill("fishing", user);
		populateSkill("cooking", user);
		populateSkill("firemaking", user);
		populateSkill("woodcutting", user);
		populateSkill("farming", user);
		populateSkill("summoning", user);
	}

	function populateSkill(skillName, user) {
		$($('#' + skillName + ' .skill-level')[0]).text(user.stats[skillName].level.toString());
	}

	function populateSummary(user) {
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

		var statNamesArray = [
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

		var userValues = userString.trim().split(/\s+/);

		if(userValues.length < statNamesArray.length) {
			throw "Expected user values to be at least the length of the statNamesArray";
		}

		for(var i = 0; i < statNamesArray.length; i++) {
			var statName = statNamesArray[i];
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

		var statNamesArray = [
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

		for(var i = 0; i < statNamesArray.length; i++) {
			var statName = statNamesArray[i];

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
