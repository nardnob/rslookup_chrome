(function() {
	var vm = this;
	this.loadingCount = 0;
	this.loadingControls = [];

	document.addEventListener('DOMContentLoaded', function () {
		activate();
	});

	function activate() {
		registerLoadingControls();
		registerEvents();
	}

	function registerLoadingControls() {
		vm.loadingControls.push($("#input-user"));
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
		setTimeout(userReturned, 500);
	}

	function userReturned() {
		$('.collapsed').removeClass('collapsed');
		decrementLoading();
	}

	function incrementLoading() {
		if(vm.loadingCount <= 0) {
			toggleLoadingControls(false);
		}

		vm.loadingCount++;
	}

	function decrementLoading() {
		vm.loadingCount--;

		if(vm.loadingCount <= 0) {
			toggleLoadingControls(true);
		}
	}

	function toggleLoadingControls(enabled) {
		for(var i = 0; i < vm.loadingControls.length; i++) {
			vm.loadingControls[i].prop('disabled', !enabled);
		}
	}
})();
