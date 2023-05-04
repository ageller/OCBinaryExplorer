// https://coolcssanimation.com/how-to-trigger-a-css-animation-on-scroll/

import { useEffect } from 'react';

const addScrollAnimator = function(){
    useEffect(function(){

        // this might be better if I sent the function an id and attached to that particular element.

        const elem = document.querySelector('.animateScroll');
        elem.classList.remove('scrollTransition');

        const observer = new IntersectionObserver(
            function(entries){
                entries.forEach(function(entry){
                    if (entry){
                        if (entry.isIntersecting) {
                            elem.classList.add('scrollTransition');
                            return;
                        }
                    }
            });
        });

        observer.observe(document.querySelector('.animateScrollWrapper'));
        window.addEventListener('scroll', function(event){
            if (window.scrollY == 0){
                elem.classList.remove('scrollTransition');
            }
        });

    }, []);
  };
  
export default addScrollAnimator;