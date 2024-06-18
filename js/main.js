/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */
;
(function (window) {

    'use strict';

    var support = {
            transitions: Modernizr.csstransitions
        },
        // transition end event name
        transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'msTransition': 'MSTransitionEnd',
            'transition': 'transitionend'
        },
        transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
        onEndTransition = function (el, callback) {
            var onEndCallbackFn = function (ev) {
                if (support.transitions) {
                    if (ev.target != this) return;
                    this.removeEventListener(transEndEventName, onEndCallbackFn);
                }
                if (callback && typeof callback === 'function') {
                    callback.call(this);
                }
            };
            if (support.transitions) {
                el.addEventListener(transEndEventName, onEndCallbackFn);
            } else {
                onEndCallbackFn();
            }
        },

        // the pages wrapper
        stack = document.querySelector('.pages-stack'),
        // the page elements
        pages = [].slice.call(stack.children),
        // total number of page elements
        pagesTotal = pages.length,
        // index of current page
        current = 0,
        // menu button
        menuCtrl = document.querySelector('button.menu-button'),
        // the navigation wrapper
        nav = document.querySelector('.pages-nav'),
        // the menu nav items
        navItems = [].slice.call(nav.querySelectorAll('.link--page')),
        // check if menu is open
        isMenuOpen = false;

    function init() {
        buildStack();
        initEvents();
    }

    function buildStack() {
        var stackPagesIdxs = getStackPagesIdxs();

        // set z-index, opacity, initial transforms to pages and add class page--inactive to all except the current one
        for (var i = 0; i < pagesTotal; ++i) {
            var page = pages[i],
                posIdx = stackPagesIdxs.indexOf(i);

            if (current !== i) {
                classie.add(page, 'page--inactive');

                if (posIdx !== -1) {
                    // visible pages in the stack
                    page.style.WebkitTransform = 'translate3d(0,100%,0)';
                    page.style.transform = 'translate3d(0,100%,0)';
                } else {
                    // invisible pages in the stack
                    page.style.WebkitTransform = 'translate3d(0,75%,-300px)';
                    page.style.transform = 'translate3d(0,75%,-300px)';
                }
            } else {
                classie.remove(page, 'page--inactive');
                //page.style.overflow = 'scroll'; //allow the page to scroll
            }

            page.style.zIndex = i < current ? parseInt(current - i) : parseInt(pagesTotal + current - i);

            if (posIdx !== -1) {
                page.style.opacity = parseFloat(1 - 0.1 * posIdx);
            } else {
                page.style.opacity = 0;
            }
        }
    }

    // event binding
    function initEvents() {
        // menu button click
        menuCtrl.addEventListener('click', toggleMenu);

        // navigation menu clicks
        navItems.forEach(function (item) {
            // which page to open?
            var pageid = item.getAttribute('href').slice(1);
            item.addEventListener('click', function (ev) {
                ev.preventDefault();
                openPage(pageid);
            });
        });

        // clicking on a page when the menu is open triggers the menu to close again and open the clicked page
        pages.forEach(function (page) {
            var pageid = page.getAttribute('id');
            page.addEventListener('click', function (ev) {
                if (isMenuOpen) {
                    ev.preventDefault();
                    openPage(pageid);
                }
            });
        });

        // keyboard navigation events
        document.addEventListener('keydown', function (ev) {
            if (!isMenuOpen) return;
            var keyCode = ev.keyCode || ev.which;
            if (keyCode === 27) {
                closeMenu();
            }
        });
    }

    // toggle menu fn
    function toggleMenu() {
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
            isMenuOpen = true;
        }
    }

    // opens the menu
    function openMenu() {
        // toggle the menu button
        classie.add(menuCtrl, 'menu-button--open')
            // stack gets the class "pages-stack--open" to add the transitions
        classie.add(stack, 'pages-stack--open');
        // reveal the menu
        classie.add(nav, 'pages-nav--open');

        // now set the page transforms
        var stackPagesIdxs = getStackPagesIdxs();
        for (var i = 0, len = stackPagesIdxs.length; i < len; ++i) {
            var page = pages[stackPagesIdxs[i]];
            page.style.WebkitTransform = 'translate3d(0, 75%, ' + parseInt(-1 * 200 - 50 * i) + 'px)'; // -200px, -230px, -260px
            page.style.transform = 'translate3d(0, 75%, ' + parseInt(-1 * 200 - 50 * i) + 'px)';
        }
    }

    // closes the menu
    function closeMenu() {
        // same as opening the current page again
        openPage();
    }

    // opens a page
    function openPage(id) {
        var futurePage = id ? document.getElementById(id) : pages[current],
            futureCurrent = pages.indexOf(futurePage),
            stackPagesIdxs = getStackPagesIdxs(futureCurrent);

        // set transforms for the new current page
        futurePage.style.WebkitTransform = 'translate3d(0, 0, 0)';
        futurePage.style.transform = 'translate3d(0, 0, 0)';
        futurePage.style.opacity = 1;

        // set transforms for the other items in the stack
        for (var i = 0, len = stackPagesIdxs.length; i < len; ++i) {
            var page = pages[stackPagesIdxs[i]];
            page.style.WebkitTransform = 'translate3d(0,100%,0)';
            page.style.transform = 'translate3d(0,100%,0)';
        }

        // set current
        if (id) {
            current = futureCurrent;
        }

        // close menu..
        classie.remove(menuCtrl, 'menu-button--open');
        classie.remove(nav, 'pages-nav--open');
        onEndTransition(futurePage, function () {
            classie.remove(stack, 'pages-stack--open');
            // reorganize stack
            buildStack();
            isMenuOpen = false;
        });
    }

    // gets the current stack pages indexes. If any of them is the excludePage then this one is not part of the returned array
    function getStackPagesIdxs(excludePageIdx) {
        var nextStackPageIdx = current + 1 < pagesTotal ? current + 1 : 0,
            nextStackPageIdx_2 = current + 2 < pagesTotal ? current + 2 : 1,
            idxs = [],

            excludeIdx = excludePageIdx || -1;

        if (excludePageIdx != current) {
            idxs.push(current);
        }
        if (excludePageIdx != nextStackPageIdx) {
            idxs.push(nextStackPageIdx);
        }
        if (excludePageIdx != nextStackPageIdx_2) {
            idxs.push(nextStackPageIdx_2);
        }

        return idxs;
    }

    init();



    ///----------------------Form----------------------------


    // Auto resize input
    function resizeInput() {
        $(this).attr('size', $(this).val().length);
    }

    $('input[type="text"], input[type="email"]')
        // event handler
        .keyup(resizeInput)
        // resize on page load
        .each(resizeInput);


    console.clear();
    // Adapted from georgepapadakis.me/demo/expanding-textarea.html
    (function () {

        var textareas = document.querySelectorAll('.expanding'),

            resize = function (t) {
                t.style.height = 'auto';
                t.style.overflow = 'hidden'; // Ensure scrollbar doesn't interfere with the true height of the text.
                t.style.height = (t.scrollHeight + t.offset) + 'px';
                t.style.overflow = '';
            },

            attachResize = function (t) {
                if (t) {
                    console.log('t.className', t.className);
                    t.offset = !window.opera ? (t.offsetHeight - t.clientHeight) : (t.offsetHeight + parseInt(window.getComputedStyle(t, null).getPropertyValue('border-top-width')));

                    resize(t);

                    if (t.addEventListener) {
                        t.addEventListener('input', function () {
                            resize(t);
                        });
                        t.addEventListener('mouseup', function () {
                            resize(t);
                        }); // set height after user resize
                    }

                    t['attachEvent'] && t.attachEvent('onkeyup', function () {
                        resize(t);
                    });
                }
            };

        // IE7 support
        if (!document.querySelectorAll) {

            function getElementsByClass(searchClass, node, tag) {
                var classElements = new Array();
                node = node || document;
                tag = tag || '*';
                var els = node.getElementsByTagName(tag);
                var elsLen = els.length;
                var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
                for (i = 0, j = 0; i < elsLen; i++) {
                    if (pattern.test(els[i].className)) {
                        classElements[j] = els[i];
                        j++;
                    }
                }
                return classElements;
            }

            textareas = getElementsByClass('expanding');
        }

        for (var i = 0; i < textareas.length; i++) {
            attachResize(textareas[i]);
        }

    })();



    //----------------- STORE -----------------------------------------------------------


    //final width --> this is the quick view image slider width
    //maxQuickWidth --> this is the max-width of the quick-view panel
    var sliderFinalWidth = 400,
        maxQuickWidth = 900;

    //open the quick view panel
    $('.cd-trigger').on('click', function (event) {
        var selectedImage = $(this).parent('.cd-item').children('img'),
            slectedImageUrl = selectedImage.attr('src'),
            targetID = event.target.id;


        if (targetID == "ex-trig") {
            $('#ex-info').show();
            $('#sp-info').hide();
            $('#or-info').hide();
        } else if (targetID == "sp-trig") {
            $('#sp-info').show();
            $('#ex-info').hide();
            $('#or-info').hide();
        } else if (targetID == "or-trig") {
            $('#or-info').show();
            $('#ex-info').hide();
            $('#sp-info').hide();
        }

        $('body').addClass('overlay-layer');
        animateQuickView(selectedImage, sliderFinalWidth, maxQuickWidth, 'open');

        //update the visible slider image in the quick view panel
        //you don't need to implement/use the updateQuickView if retrieving the quick view data with ajax
        updateQuickView(slectedImageUrl);


    });

    //close the quick view panel
    $('body').on('click', function (event) {
        if ($(event.target).is('.cd-close') || $(event.target).is('body.overlay-layer')) {
            closeQuickView(sliderFinalWidth, maxQuickWidth);
        }
    });
    $(document).keyup(function (event) {
        //check if user has pressed 'Esc'
        if (event.which == '27') {
            closeQuickView(sliderFinalWidth, maxQuickWidth);
        }
    });

    //quick view slider implementation
    $('.cd-quick-view').on('click', '.cd-slider-navigation a', function () {
        updateSlider($(this));
    });

    //center quick-view on window resize
    $(window).on('resize', function () {
        if ($('.cd-quick-view').hasClass('is-visible')) {
            window.requestAnimationFrame(resizeQuickView);
        }
    });

    function updateSlider(navigation) {
        var sliderConatiner = navigation.parents('.cd-slider-wrapper').find('.cd-slider'),
            activeSlider = sliderConatiner.children('.selected').removeClass('selected');
        if (navigation.hasClass('cd-next')) {
            (!activeSlider.is(':last-child')) ? activeSlider.next().addClass('selected'): sliderConatiner.children('li').eq(0).addClass('selected');
        } else {
            (!activeSlider.is(':first-child')) ? activeSlider.prev().addClass('selected'): sliderConatiner.children('li').last().addClass('selected');
        }
    }

    function updateQuickView(url) {
        $('.cd-quick-view .cd-slider li').removeClass('selected').find('img[src="' + url + '"]').parent('li').addClass('selected');
    }

    function resizeQuickView() {
        var quickViewLeft = ($(window).width() - $('.cd-quick-view').width()) / 2,
            quickViewTop = ($(window).height() - $('.cd-quick-view').height()) / 2;
        $('.cd-quick-view').css({
            "top": quickViewTop,
            "left": quickViewLeft,
        });
    }

    function closeQuickView(finalWidth, maxQuickWidth) {
        var close = $('.cd-close'),
            activeSliderUrl = close.siblings('.cd-slider-wrapper').find('.selected img').attr('src'),
            selectedImage = $('.empty-box').find('img');
        //update the image in the gallery
        if (!$('.cd-quick-view').hasClass('velocity-animating') && $('.cd-quick-view').hasClass('add-content')) {
            selectedImage.attr('src', activeSliderUrl);
            animateQuickView(selectedImage, finalWidth, maxQuickWidth, 'close');
        } else {
            closeNoAnimation(selectedImage, finalWidth, maxQuickWidth);
        }
    }

    function animateQuickView(image, finalWidth, maxQuickWidth, animationType) {
        //store some image data (width, top position, ...)
        //store window data to calculate quick view panel position
        var parentListItem = image.parent('.cd-item'),
            topSelected = image.offset().top - $(window).scrollTop(),
            leftSelected = image.offset().left,
            widthSelected = image.width(),
            heightSelected = image.height(),
            windowWidth = $(window).width(),
            windowHeight = $(window).height(),
            finalLeft = (windowWidth - finalWidth) / 2,
            finalHeight = finalWidth * heightSelected / widthSelected,
            finalTop = (windowHeight - finalHeight) / 2,
            quickViewWidth = (windowWidth * .8 < maxQuickWidth) ? windowWidth * .8 : maxQuickWidth,
            quickViewLeft = (windowWidth - quickViewWidth) / 2;

        if (animationType == 'open') {
            //hide the image in the gallery
            parentListItem.addClass('empty-box');
            //place the quick view over the image gallery and give it the dimension of the gallery image
            $('.cd-quick-view').css({
                "top": topSelected,
                "left": leftSelected,
                "width": widthSelected,
            }).velocity({
                //animate the quick view: animate its width and center it in the viewport
                //during this animation, only the slider image is visible
                'top': finalTop + 'px',
                'left': finalLeft + 'px',
                'width': finalWidth + 'px',
            }, 1000, [400, 20], function () {
                //animate the quick view: animate its width to the final value
                $('.cd-quick-view').addClass('animate-width').velocity({
                    'left': quickViewLeft + 'px',
                    'width': quickViewWidth + 'px',
                }, 300, 'ease', function () {
                    //show quick view content
                    $('.cd-quick-view').addClass('add-content');
                });
            }).addClass('is-visible');

        } else {
            //close the quick view reverting the animation
            $('.cd-quick-view').removeClass('add-content').velocity({
                'top': finalTop + 'px',
                'left': finalLeft + 'px',
                'width': finalWidth + 'px',
            }, 300, 'ease', function () {
                $('body').removeClass('overlay-layer');
                $('.cd-quick-view').removeClass('animate-width').velocity({
                    "top": topSelected,
                    "left": leftSelected,
                    "width": widthSelected,
                }, 500, 'ease', function () {
                    $('.cd-quick-view').removeClass('is-visible');
                    parentListItem.removeClass('empty-box');
                });
            });
        }
    }

    function closeNoAnimation(image, finalWidth, maxQuickWidth) {
        var parentListItem = image.parent('.cd-item'),
            topSelected = image.offset().top - $(window).scrollTop(),
            leftSelected = image.offset().left,
            widthSelected = image.width();

        //close the quick view reverting the animation
        $('body').removeClass('overlay-layer');
        parentListItem.removeClass('empty-box');
        $('.cd-quick-view').velocity("stop").removeClass('add-content animate-width is-visible').css({
            "top": topSelected,
            "left": leftSelected,
            "width": widthSelected,
        });
    }



    //---------------------CARD------------------------

    var cartWrapper = $('.cd-cart-container');
    //product id - you don't need a counter in your real project but you can use your real product id
    var productId = 0;

    if (cartWrapper.length > 0) {
        //store jQuery objects
        var cartBody = cartWrapper.find('.body')
        var cartList = cartBody.find('ul').eq(0);
        var cartTotal = cartWrapper.find('.checkout').find('span');
        var cartTrigger = cartWrapper.children('.cd-cart-trigger');
        var cartCount = cartTrigger.children('.count')
        var addToCartBtn = $('.cd-add-to-cart');
        var undo = cartWrapper.find('.undo');
        var undoTimeoutId;

        //add product to cart
        addToCartBtn.on('click', function (event) {
            event.preventDefault();
            addToCart($(this));
        });

        //open/close cart
        cartTrigger.on('click', function (event) {
            event.preventDefault();
            toggleCart();
        });

        //close cart when clicking on the .cd-cart-container::before (bg layer)
        cartWrapper.on('click', function (event) {
            if ($(event.target).is($(this))) toggleCart(true);
        });

        //delete an item from the cart
        cartList.on('click', '.delete-item', function (event) {
            event.preventDefault();
            removeProduct($(event.target).parents('.product'));
        });

        //update item quantity
        cartList.on('change', 'select', function (event) {
            quickUpdateCart();
        });

        //reinsert item deleted from the cart
        undo.on('click', 'a', function (event) {
            clearInterval(undoTimeoutId);
            event.preventDefault();
            cartList.find('.deleted').addClass('undo-deleted').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                $(this).off('webkitAnimationEnd oanimationend msAnimationEnd animationend').removeClass('deleted undo-deleted').removeAttr('style');
                quickUpdateCart();
            });
            undo.removeClass('visible');
        });
    }

    function toggleCart(bool) {
        var cartIsOpen = (typeof bool === 'undefined') ? cartWrapper.hasClass('cart-open') : bool;

        if (cartIsOpen) {
            cartWrapper.removeClass('cart-open');
            //reset undo
            clearInterval(undoTimeoutId);
            undo.removeClass('visible');
            cartList.find('.deleted').remove();

            setTimeout(function () {
                cartBody.scrollTop(0);
                //check if cart empty to hide it
                if (Number(cartCount.find('li').eq(0).text()) == 0) cartWrapper.addClass('empty');
            }, 500);
        } else {
            cartWrapper.addClass('cart-open');
        }
    }

    function addToCart(trigger) {
        var cartIsEmpty = cartWrapper.hasClass('empty');
        //update cart product list
        addProduct(trigger.data('name'), trigger.data('price'), trigger.data('url'));
        //update number of items 
        updateCartCount(cartIsEmpty);
        //update total price
        updateCartTotal(trigger.data('price'), true);
        //show cart
        cartWrapper.removeClass('empty');
    }

    function addProduct(productName, price, previewURL) {
        //this is just a product placeholder
        //you should insert an item with the selected product info
        //replace productId, productName, price and url with your real product info
        productId = productId + 1;
        var productAdded = $('<li class="product"><div class="product-image"><a href="#0"><img src="' + previewURL + '" alt="placeholder"></a></div><div class="product-details"><h3><a href="#0">' + productName + '</a></h3><span class="price">' + price + '</span><div class="actions"><a href="#0" class="delete-item">Delete</a><div class="quantity"><label for="cd-product-' + productId + '">Qty</label><span class="select"><select id="cd-product-' + productId + '" name="quantity"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option></select></span></div></div></div></li>');
        cartList.prepend(productAdded);
    }

    function removeProduct(product) {
        clearInterval(undoTimeoutId);
        cartList.find('.deleted').remove();

        var topPosition = product.offset().top - cartBody.children('ul').offset().top,
            productQuantity = Number(product.find('.quantity').find('select').val()),
            productTotPrice = Number(product.find('.price').text().replace('$', '')) * productQuantity;

        product.css('top', topPosition + 'px').addClass('deleted');

        //update items count + total price
        updateCartTotal(productTotPrice, false);
        updateCartCount(true, -productQuantity);
        undo.addClass('visible');

        //wait 8sec before completely remove the item
        undoTimeoutId = setTimeout(function () {
            undo.removeClass('visible');
            cartList.find('.deleted').remove();
        }, 8000);
    }

    function quickUpdateCart() {
        var quantity = 0;
        var price = 0;

        cartList.children('li:not(.deleted)').each(function () {
            var singleQuantity = Number($(this).find('select').val());
            quantity = quantity + singleQuantity;
            price = price + singleQuantity * Number($(this).find('.price').text().replace('$', ''));
        });

        cartTotal.text(price.toFixed(2));
        cartCount.find('li').eq(0).text(quantity);
        cartCount.find('li').eq(1).text(quantity + 1);
    }

    function updateCartCount(emptyCart, quantity) {
        if (typeof quantity === 'undefined') {
            var actual = Number(cartCount.find('li').eq(0).text()) + 1;
            var next = actual + 1;

            if (emptyCart) {
                cartCount.find('li').eq(0).text(actual);
                cartCount.find('li').eq(1).text(next);
            } else {
                cartCount.addClass('update-count');

                setTimeout(function () {
                    cartCount.find('li').eq(0).text(actual);
                }, 150);

                setTimeout(function () {
                    cartCount.removeClass('update-count');
                }, 200);

                setTimeout(function () {
                    cartCount.find('li').eq(1).text(next);
                }, 230);
            }
        } else {
            var actual = Number(cartCount.find('li').eq(0).text()) + quantity;
            var next = actual + 1;

            cartCount.find('li').eq(0).text(actual);
            cartCount.find('li').eq(1).text(next);
        }
    }

    function updateCartTotal(price, bool) {
        bool ? cartTotal.text((Number(cartTotal.text()) + Number(price)).toFixed(2)) : cartTotal.text((Number(cartTotal.text()) - Number(price)).toFixed(2));
    }

})(window);
