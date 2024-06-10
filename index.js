$(document).ready(function() {

    // variables

    let windowUp = false; // boolean for telling the gear to stop glowing so much if the window isn't active anymore
    let lastWindowPosition = [120, 30]; // window position memory

    // magic
    let $viewport = $("#viewport");
    let $dustCanvas = $("#dust-canvas");

    // window
    let $optionsButton = $("#options-button");
    let $optionsWindow = $("#options-window");

    // this gets repetitive but also writing down the whole thing would be even more repetitive
    // essentially, it's the slider, the numeric display, and the reset button for each option (hardcoded)
    let $inputAmountSlider = $("#input-amount>.option-bar>.option-slider");
    let $inputSizeSlider = $("#input-size>.option-bar>.option-slider");
    let $inputLifespanSlider = $("#input-lifespan>.option-bar>.option-slider");
    let $inputGenerationSlider = $("#input-generation>.option-bar>.option-slider");
    let $inputDotColorPicker = $("#input-dotcolor>.option-bar>.option-picker");
    let $inputBGColorPicker = $("#input-bgcolor>.option-bar>.option-picker");
    
    let $inputAmountDisplay = $("#input-amount>.option-bar>.option-indicator");
    let $inputSizeDisplay = $("#input-size>.option-bar>.option-indicator");
    let $inputLifespanDisplay = $("#input-lifespan>.option-bar>.option-indicator");
    let $inputGenerationDisplay = $("#input-generation>.option-bar>.option-indicator");
    let $inputDotColorDisplay = $("#input-dotcolor>.option-bar>.option-indicator");
    let $inputBGColorDisplay = $("#input-bgcolor>.option-bar>.option-indicator");

    let $inputAmountReset = $("#input-amount>.option-bar>.option-reset");
    let $inputSizeReset = $("#input-size>.option-bar>.option-reset");
    let $inputLifespanReset = $("#input-lifespan>.option-bar>.option-reset");
    let $inputGenerationReset = $("#input-generation>.option-bar>.option-reset");
    let $inputDotColorReset = $("#input-dotcolor>.option-bar>.option-reset");
    let $inputBGColorReset = $("#input-bgcolor>.option-bar>.option-reset");

    // cursor
    let $drag = $("#drag");
    let $tap = $("#tap");

    // and finally, the buttons to manage everything
    let $resetAll = $("#button-resetall");
    let $clear = $("#button-clear");

    // cursor booleans
    let isTouching = false;
    let currentTap = undefined;
    let scrollOffset = 0;

    let cDimensions = 15; // size of cursor particle

    // functions
    // generate c colored particles of amount a, diameter d, and lifespan l
    function generate(c = "f5faff", a = 3, d = 10, l = 10) {
        a = Math.floor(Math.random() * a) + 1;
        let i = 0;
        while (i < a) {
            if ($dustCanvas.children().length < 100) {
                let diameter = Math.floor(Math.random() * parseInt(d)) + 5; // size of particle
                let left = Math.floor(Math.random() * 109) - 10; // where particle begins, x-axis
                let bottom = Math.floor(Math.random() * 20) - 10; // where particle begins, y-axis
                // build particle
                let $particleBuild = $("<div>", {
                    class: "particle",
                    css: {
                        "background-color": c,
                        "width": diameter,
                        "height": diameter,
                        "left": `${left}%`,
                        "bottom": `${bottom}%`
                    }
                });
                
                // particle lifespan: how long particle will remain rendered
                let lifespan = Math.floor((Math.random() * parseInt(l)) + 500);

                $dustCanvas.append($particleBuild); // add particle into canvas
                // animation: float upwards to the right and gradually disappear
                setTimeout(() => { // opacity animation workaround
                    $particleBuild.toggleClass("dfo");
                    $particleBuild.css("animation-duration", `${lifespan}ms`);
                }, parseInt($(".particle").css("animation-duration"))+1000);
                $particleBuild.animate({
                    left: `+=${Math.floor(Math.random() * 20) + 15}%`,
                    bottom: `+=${Math.floor(Math.random() * 45) + 30}%`
                }, lifespan+1000, "linear", function() {
                    $(this).remove(); // remove so it doesn't clutter
                });
            }
            ++i;
        };
    };

    // it's the better alternative to four booleans ok
    function update(options = "000000") {
        if (options.charAt(0) == "1") $inputAmountDisplay.text($inputAmountSlider.val());
        if (options.charAt(1) == "1") $inputSizeDisplay.text($inputSizeSlider.val());
        if (options.charAt(2) == "1") $inputLifespanDisplay.text($inputLifespanSlider.val());
        if (options.charAt(3) == "1") {
            // yes, update it and all
            // but to do that the whole timer has to change :(
            $inputGenerationDisplay.text($inputGenerationSlider.val());
            clearTimeout(currentGen);
            currentGen = setInterval(() => {
                generate($inputDotColorPicker.val(), $inputAmountSlider.val(), $inputSizeSlider.val(), $inputLifespanSlider.val());
            }, $inputGenerationSlider.val());
        };
        if (options.charAt(4) == "1") $inputDotColorDisplay.text($inputDotColorPicker.val());
        if (options.charAt(5) == "1") {
            $inputBGColorDisplay.text($inputBGColorPicker.val());
            $viewport.css("background-color", $inputBGColorPicker.val());
        };
    };

    // same here, but with resetting the values
    function reset(options = "000000") {
        if (options.charAt(0) == "1") $inputAmountSlider.val(3);
        if (options.charAt(1) == "1") $inputSizeSlider.val(10);
        if (options.charAt(2) == "1") $inputLifespanSlider.val(15000);
        if (options.charAt(3) == "1") $inputGenerationSlider.val(500);
        if (options.charAt(4) == "1") $inputDotColorPicker.val("#f5faff");
        if (options.charAt(5) == "1") $inputBGColorPicker.val("#00050a");
        update(options);
    };

    // open options window
    function openWindow(left = 30, top = 120) {
        windowUp = true;
        $optionsWindow.css("display", "inline-block");
        $optionsWindow.animate({
            opacity: 1,
            left: `${left}px`,
            top: `${top}px`,
            fontSize: "16px",
            width: "720px"
        }, 250);
    };

    // close options window
    function closeWindow(minimize = false) {
        windowUp = false;
        $optionsButton.css("opacity", "0.25");
        if (minimize) {
            $optionsWindow.animate({
                opacity: 0,
                top: "-=30px"
            }, 250, undefined, function() {
                $optionsWindow.css("display", "none");
                $optionsWindow.css("left", "15px");
                $optionsWindow.css("top", "15px");
            });
        }
        else {
            $optionsWindow.animate({
                opacity: 0,
                left: "15px",
                top: "15px",
                fontSize: "1px",
                width: "72px"
            }, 250, undefined, function() {
                $optionsWindow.css("display", "none");
            });
        }
    };

    function dragInit(cursorPosition) {
        // in the club, draggin' it
        // and by it, I mean the window div
        let dragParameters = {
            dElement: $optionsWindow,
            currentX: cursorPosition.pageX,
            currentY: cursorPosition.pageY,
            offset: $optionsWindow.offset()
        };
    
        function draggingIP(cursorPosition) {
            let xPos = dragParameters.offset.left + (cursorPosition.pageX - dragParameters.currentX);
            let yPos = dragParameters.offset.top + (cursorPosition.pageY - dragParameters.currentY);
            $(dragParameters.dElement).offset({left: xPos, top: yPos});
        };
    
        function dragFinished(){
            $(document)
                .off('mousemove', draggingIP)
                .off('mouseup', dragFinished);
        };
    
        $(document)
            .on('mouseup', dragFinished)
            .on('mousemove', draggingIP);
    };

    // initialize currentGen for later manipulation
    let currentGen = setInterval(() => {
        generate($inputDotColorPicker.val(), $inputAmountSlider.val(), $inputSizeSlider.val(), $inputLifespanSlider.val());
    }, ($inputGenerationSlider.val()));

    // now it's stuff dealing with options
    $optionsButton
        .hover(function() {
            // hover = fade in (a bit)
            $optionsButton.css("opacity", "0.9");
        }, function() {
            // no hover = fade out (a bit)
            if (windowUp) $optionsButton.css("opacity", "0.6");
            else $optionsButton.css("opacity", "0.3");
        })

        // indicate trigger
        .on("mousedown", function() {
            $optionsButton.css("filter", "brightness(150%)");
        })

        // indicate post-trigger
        .on("mouseup", function() {
            $optionsButton.css("filter", "brightness(100%)");
        })

        // gear button
        .on("click", function() {
            if (windowUp) {
                lastWindowPosition = [parseInt($optionsWindow.css("left")), parseInt($optionsWindow.css("top"))];
                closeWindow();
            }
            else openWindow(lastWindowPosition[0], lastWindowPosition[1]);
        });

    $("#options-title").on("mousedown", dragInit);

    // x button
    $("#options-close-button").on("click", function() {
        lastWindowPosition = [120, 30];
        closeWindow(true);
    });

    // slider updating (upon input and reset events)
    // amount
    $inputAmountSlider.on("input", function() {
        update("100000");
    });
    $inputAmountReset.on("click", function() {
        reset("100000");
    });

    // size
    $inputSizeSlider.on("input", function() {
        update("010000");
    });
    $inputSizeReset.on("click", function() {
        reset("010000");
    });

    // lifespan
    $inputLifespanSlider.on("input", function() {
        update("001000");
    });
    $inputLifespanReset.on("click", function() {
        reset("001000");
    });

    // generation
    $inputGenerationSlider.on("input", function() {
        update("000100");
    });
    $inputGenerationReset.on("click", function() {
        reset("000100");
    });

    // dot color
    $inputDotColorPicker.on("input", function() {
        update("000010");
    });
    $inputDotColorReset.on("click", function() {
        reset("000010");
    });
    
    // bg color
    $inputBGColorPicker.on("input", function() {
        update("000001");
    });
    $inputBGColorReset.on("click", function() {
        reset("000001");
    });
    
    // reset everything to default
    $resetAll.on("click", function() {
        reset("111111");
    });
    
    // clear the canvas
    $clear.on("click", function() {
        $dustCanvas.empty();
        clearTimeout(currentGen);
        currentGen = setInterval(() => {
            generate($inputDotColorPicker.val(), $inputAmountSlider.val(), $inputSizeSlider.val(), $inputLifespanSlider.val());
        }, $inputGenerationSlider.val());
    });

    // initialize
    reset("111111");
    update("111111");

    $("#credit").html($("footer>.footer-box>.textbox>div").html());
    $("footer").remove();

    $(document).on("mousedown", function(position) {
        isTouching = true;
        if (!$tap.hasClass("ped")) {
            let tapDimension = parseInt($tap.css("width"));
            $tap
                .addClass("ped")
                .css({
                    left: `${position.pageX - (tapDimension / 2)}px`,
                    top: `${position.pageY - (tapDimension / 2) - scrollOffset}px`
                });
            clearTimeout(currentTap);
            currentTap = setTimeout(() => {
                $tap.removeClass("ped");
            }, 250);
        };
    });

    $(document).on("mousemove", function(position) {
        if (isTouching) {
            let $dragpiece = $("<div>", {
                class: "dtrailpiece",
                css: {
                    left: `${position.pageX - (cDimensions / 2)}px`,
                    top: `${position.pageY - (cDimensions / 2) - scrollOffset}px`
                }
            });
            let dustDimensions = Math.floor(Math.random() * cDimensions * 1.5);
            let $dragdust = $("<div>", {
                class: "dragdust",
                css: {
                    left: `${position.pageX - (cDimensions * 1.25) + Math.floor(Math.random() * cDimensions * 2.5)}px`,
                    top: `${position.pageY - (cDimensions * 1.25) + Math.floor(Math.random() * cDimensions * 2.5) - scrollOffset}px`,
                    width: `${dustDimensions}px`,
                    height: `${dustDimensions}px`,
                    opacity: Math.random(),
                }
            });
            $drag
                .append($dragpiece)
                .append($dragdust);
                $dragpiece.animate({
                    left: `${position.pageX}px`,
                    top: `${position.pageY - scrollOffset}px`
                }, 400, "linear", function() {
                    $(this).remove();
                    $dragdust.remove();
                });
        }
    });

    $(document).on("mouseup", function() {
        isTouching = false;
    });

    $(document).on("scroll", function() {
        scrollOffset = $(this).scrollTop();
    });

});