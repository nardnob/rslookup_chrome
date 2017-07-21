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
		incrementLoading();
		collapseSkillSection();

		$.get(vm.rs3HiscoresApi + user, userReturned).fail(failedToRetrieveUser);
	}

	function userReturned(user) {
		expandSkillSection();
		$('#input-user').val('success');
		decrementLoading();
		$('#input-user').select();
	}

	function failedToRetrieveUser() {
		$('#input-user').val('failure');
		decrementLoading();
		$('#input-user').select();
	}

	function incrementLoading() {
		vm.loadingCount++;

		if(vm.loadingCount == 1) {
			//If we've just begun loading, disable the loading controls
			disableLoadingControls();
		}
	}

	function decrementLoading() {
		vm.loadingCount--;

		if(vm.loadingCount == 0) {
			//If we've just finished loading, enable the loading controls
			enableLoadingControls();
		}
	}

	function expandSkillSection() {
		$('#skill-section').removeClass('collapsed');
		$('.skill-col').removeClass('collapsed');
	}

	function collapseSkillSection() {
		$('#skill-section').addClass('collapsed');
		$('.skill-col').addClass('collapsed');
	}

	function enableLoadingControls() {
		toggleLoadingControls(true);
	}

	function disableLoadingControls() {
		toggleLoadingControls(false);
	}

	function toggleLoadingControls(enabled) {
		for(var i = 0; i < vm.loadingControls.length; i++) {
			vm.loadingControls[i].prop('disabled', !enabled);
		}
	}
})();
