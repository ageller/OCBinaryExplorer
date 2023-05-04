// https://coolcssanimation.com/how-to-trigger-a-css-animation-on-scroll/

// Remove the transition class (I think this only works on one element; I would want to expand to make it work on every one)
// and I probably shouldn't have a global elem in here
const elem = document.querySelector('.animateScroll');
elem.classList.remove('scrollTransition');

// Create the observer, same as before:
const observer = new IntersectionObserver(
	function(entries){
		entries.forEach(function(entry){
			if (entry.isIntersecting) {
				elem.classList.add('scrollTransition');
				return;
			}

			// elem.classList.remove('scrollTransition');
	});
});

observer.observe(document.querySelector('.animateScrollWrapper'));
window.addEventListener('scroll', function(event){
	if (window.scrollY == 0){
		elem.classList.remove('scrollTransition');
	}
});
