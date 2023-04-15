window.addEventListener('load', function(){

var box = null;

var mouse = {
  MouseX: 0,
  MouseY: 0,
  mouseStartX: 0,
  mouseStartY: 0
};

var count = 1;
var boxCount = 1;
var boxList = [];
var boxArrayGroup = [];

var boxPastSelect = [];

var reversedNum = [];

var drawnItemDataEqualTo;
var drawnItemData = {};
var rect;
var layer;
var body = document.querySelector('.body');
var wrapperWhole = document.querySelector('.wrapper');
var boxDrawButton = document.querySelector('.fa-square');
var arrangeTop = document.querySelector('.arrangeTopButton');
var arrangeTopOne = document.querySelector('.arrangeTopOne');
var arrangeBottom = document.querySelector('.arrangeBottomButton');
var arrangeBottomOne = document.querySelector('.arrangeBottomOne');
var outputX = document.querySelector('.outputX');
var outputY = document.querySelector('.outputY');
var outputName = document.querySelector('.outputName');
var layerOutput = document.querySelector('.layerOutput');
var drawnItem = document.querySelectorAll('.drawnItem');
var selectedItem = document.querySelectorAll('.selectedDiv');
var DrawLayer = document.querySelector('#DrawLayer');
// TO BE FIXED, CODE NEEDS TO BE CHANGED TO HIDE LINE MATCHING
// var lineMatchingButton = document.querySelector('.lineMatchingButton');
//
// lineMatchingButton.addEventListener('click', function(){
//   lineMatchingButton.classList.toggle('insetButton');
//   lineMatchingButton.classList.toggle('extraShadowButton');
//   $("#guide-v, #guide-h").hide();
// });

// -- START -- EVENT LISTENER FOR BOX-DRAWING BUTTON
boxDrawButton.addEventListener('click', function(){
  boxDrawButton.classList.toggle('shadowInsetButton');
  return initiatorDraw(document.getElementById('DrawLayer'));
});
// -- END --

    // -- START -- GET X AND Y COORDINATES OF SELECTED ELEMENT AND DISPLAY THEM DYNAMICALLY
    function fetchXYcoordinates(){
        var el = document.querySelectorAll('.drawnItem');
        for (i = 0; i < el.length; i++){
          el[i].addEventListener('mousedown', function(e) {
            function mouseMoveHandler(e) {
              var resetLayer = document.querySelector('.resetLayer');
              dynamicData = resetLayer.getBoundingClientRect();
              outputX.innerHTML = dynamicData.x;
              outputY.innerHTML = dynamicData.y;
            }
            window.addEventListener('mousemove', mouseMoveHandler);
          });
        }
    };
    // -- END --

    // TO BE FIXED, TO DUPLICATE BOX
    // var original = document.querySelectorAll('.selectedDiv')[0];
    //
    // function duplicate() {
    //     var clone = original.cloneNode(true); // "deep" clone
    //     clone.id = "duplicated";
    //     // or clone.id = ""; if the divs don't need an ID
    //     original.parentNode.appendChild(clone);
    // }

    // -- START -- DELETE SELECTED ELEMENT WITH DELETE KEY CODE 8 "DELETE"
    document.addEventListener('keydown', function(event) {
        if (event.keyCode === 8) {
            $('.selectedDiv').remove();
        }
        // TO BE FIXED, TO DUPLICATE BOX
        // if (event.keyCode = 17 && event.keyCode === 67) {
        //     console.log('dddddddd');
        //     duplicate();
        // }
    });
    // -- END --

    // MAIN FUNCTION TO BE RUN ON ANY DRAWING FUNCTION
    function initiatorDraw(canvas) {
        var boxButtonActivate = boxDrawButton.classList.contains('shadowInsetButton');
        var recta = document.querySelectorAll('.drawnItem');
        var DrawLayer = document.querySelector('#DrawLayer');

        // -- START -- IF ELEMENT DOESN'T CONTAIN shadowInsetButton CHANGE POINTER EVENTS TO NONE WITH userNone
        if (boxDrawButton.classList.contains('shadowInsetButton')){
            $('.drawnItem').addClass('userNone');
        }
        // -- END --
        // -- START -- SET STYLES FOR SELECTED DIV AND REMOVE IF UN-SELECTED.
        else {
            $('.drawnItem').removeClass('userNone');
            $('.drawnItem').mousedown(function(){
                $('.drawnItem').removeClass('resetLayer');
                $(this).addClass('resetLayer');
                $('.drawnItem').removeClass('selectedDiv');
                $(this).addClass('selectedDiv');
                outputName.innerHTML = this.classList[2];
                var layerOutputUniqueClass = document.getElementsByClassName(this.classList[2]);
                for (i = 0; i < layerOutputUniqueClass.length; i++){
                  $('.layer').removeClass('selectedDiv');
                  layerOutputUniqueClass[i].classList.add('selectedDiv');
                  console.log(layerOutputUniqueClass);
                }
            });
        };
        // -- END --
        // -- START -- IF boxButtonActivate IS TRUE (CONTAINS shadowInsetButton) THEN CHANGE CURSOR, OTHERWISE, CHANGE CURSOR RUN FURTHER SCRIPT
        if (boxButtonActivate){
            canvas.style.cursor = "crosshair";
        } else {
          canvas.style.cursor = "pointer";
        // -- END / CONTINUE
        // -- START -- MAKE BOX DRAGGABLE, LINE MATCHING AND LOCKING EDGES

        $('.draggable').resizable();
        var MIN_DISTANCE = 5; // minimum distance to "snap" to a guide
        var guides = []; // no guides available ...
        var innerOffsetX, innerOffsetY; // we'll use those during drag ...

        $(".draggable").draggable({
          start: function(event, ui) {

            guides = $.map($(".draggable").not(this), computeGuidesForElement);
            console.log(guides);
            innerOffsetX = event.originalEvent.offsetX;
            innerOffsetY = event.originalEvent.offsetY;
          },
          drag: function(event, ui) {
            // iterate all guides, remember the closest h and v guides
            var guideV, guideH, distV = MIN_DISTANCE + 1,
              distH = MIN_DISTANCE + 1,
              offsetV, offsetH;
            var chosenGuides = {
              top: {
                dist: MIN_DISTANCE + 1
              },
              left: {
                dist: MIN_DISTANCE + 1
              }
            };
            var $t = $(this);
            var pos = {
              top: event.originalEvent.pageY - innerOffsetY,
              left: event.originalEvent.pageX - innerOffsetX
            };
            var w = $t.outerWidth() - 1;
            var h = $t.outerHeight() - 1;
            var elemGuides = computeGuidesForElement(null, pos, w, h);
            $.each(guides, function(i, guide) {
              $.each(elemGuides, function(i, elemGuide) {
                if (guide.type == elemGuide.type) {
                  var prop = guide.type == "h" ? "top" : "left";
                  var d = Math.abs(elemGuide[prop] - guide[prop]);
                  if (d < chosenGuides[prop].dist) {
                    chosenGuides[prop].dist = d;
                    chosenGuides[prop].offset = elemGuide[prop] - pos[prop];
                    chosenGuides[prop].guide = guide;
                  }
                }
              });
            });

            if (chosenGuides.top.dist <= MIN_DISTANCE) {
              $("#guide-h").css("top", chosenGuides.top.guide.top).show();
              ui.position.top = chosenGuides.top.guide.top - chosenGuides.top.offset;
            } else {
              $("#guide-h").hide();
              ui.position.top = pos.top;
            }

            if (chosenGuides.left.dist <= MIN_DISTANCE) {
              $("#guide-v").css("left", chosenGuides.left.guide.left).show();
              ui.position.left = chosenGuides.left.guide.left - chosenGuides.left.offset;
            } else {
              $("#guide-v").hide();
              ui.position.left = pos.left;
            }
          },
          stop: function(event, ui) {
            $("#guide-v, #guide-h").hide();
          }
        });

        fetchXYcoordinates();
        function computeGuidesForElement(elem, pos, w, h) {
          if (elem != null) {
            var $t = $(elem);
            pos = $t.offset();
            w = $t.outerWidth() - 1;
            h = $t.outerHeight() - 1;
          }

          return [{
              type: "h",
              left: pos.left,
              top: pos.top
            },
            {
              type: "h",
              left: pos.left,
              top: pos.top + h
            },
            {
              type: "v",
              left: pos.left,
              top: pos.top
            },
            {
              type: "v",
              left: pos.left + w,
              top: pos.top
            },
            // you can add _any_ other guides here as well (e.g. a guide 10 pixels to the left of an element)
            {
              type: "h",
              left: pos.left,
              top: pos.top + h / 2
            },
            {
              type: "v",
              left: pos.left + w / 2,
              top: pos.top
            }
          ];
        }
        // -- END --
      } // -- END OF ELSE STATEMENT --

        // -- START -- MAKE THE Z-INDEX OF THE DIV ITSELF EQUAL TO THE INDEX NUMBER DYNAMICALLY CHANGING.
        var boxArrayDefine = boxArrayGroup.slice(-1)[0];
        function setZIndex(){
            boxArrayDefine.forEach(function(div,index){
                div.style.zIndex = index;
            });
        };
        // -- END --

        // -- START -- ARRANGE SELECTED DIV TO BE BELOW ONE BELOW THE NEXT NEWLY CREATED DIV (231 <- 213 <- 123)
        arrangeBottomOne.addEventListener('click', function(){
            for (i = 0; i < recta.length; i++){
                for (i = 0; i < boxArrayDefine.length; i++){
                    var selectedIndexBottomOne = $(boxArrayDefine).index($('.resetLayer'));

                    var selectedIndexBefore = selectedIndexBottomOne - 1;

                    console.log(selectedIndexBefore);

                    var selectedIndexDomItem = $(boxArrayDefine).get(selectedIndexBottomOne);

                    var selectedIndexDomItemBefore = $(boxArrayDefine).get(selectedIndexBottomOne - 1);

                    console.log(selectedIndexDomItemBefore);

                };

                if (selectedIndexBefore < 0) {
                    return 0;
                }else{
                    boxArrayDefine.splice(selectedIndexBottomOne, 1, selectedIndexDomItemBefore);
                    boxArrayDefine.splice(selectedIndexBefore, 1, selectedIndexDomItem);

                    return setZIndex();
                };
            };
        });
        // -- END --

        // -- START -- ARRANGE SELECTED DIV TO BE ABOVE ONE ABOVE THE NEXT NEWLY CREATED DIV (123 -> 213 -> 231)
        arrangeTopOne.addEventListener('click', function(){
            for (i = 0; i < recta.length; i++){

                for (i = 0; i < boxArrayDefine.length; i++){
                    var selectedIndexTopOne = $(boxArrayDefine).index($('.resetLayer'));

                    var selectedIndexAfter = selectedIndexTopOne + 1;

                    var selectedIndexDomItem = $(boxArrayDefine).get(selectedIndexTopOne);

                    var selectedIndexDomItemAfter = $(boxArrayDefine).get(selectedIndexTopOne + 1);

                };

                // Logic for stopping the concatination on the array
                if (selectedIndexAfter > boxArrayDefine.length - 1) {
                    return 0;
                }else{
                    boxArrayDefine.splice(selectedIndexTopOne, 1, selectedIndexDomItemAfter);
                    boxArrayDefine.splice(selectedIndexAfter, 1, selectedIndexDomItem);

                    return setZIndex();
                };
            };
        });
        // -- END --

        // -- START -- ARRANGE SELECTED DIV TO BE ABOVE EVERY OTHER ELEMENT ON THE CANVAS
        arrangeTop.addEventListener('click', function(){

            for (i = 0; i < recta.length; i++){

                var selectedIndexTop = $(boxArrayDefine).index($('.resetLayer'));

                boxArrayDefine.push(boxArrayDefine.splice(selectedIndexTop, 1)[0]);

                return setZIndex();

            };
            return 0;
        });
        // -- END --

        // -- START -- ARRANGE SELECTED DIV TO BE UNDER EVERY OTHER ELEMENT ON THE CANVAS
        arrangeBottom.addEventListener('click', function(){
          for (i = 0; i < recta.length; i++){
            if (recta[i].classList.contains('resetLayer')){
              var selectedIndexBottom = $(boxArrayDefine).index(recta[i]);
                boxArrayDefine.unshift(boxArrayDefine.splice(selectedIndexBottom, 1)[0]);
                  return setZIndex();
            }
          };
          return 0;
        });
        // -- END --


        // -- START -- INITIAL START EVENT ON MOUSE X AND Y POSITION FOR THE EVENT OF X AND Y POSITION.
        function setMousePosition(e) {

            if (e.pageX) { //Moz // Always going to be true
                mouse.MouseX = e.pageX + window.pageXOffset; // + WINDOW FOR MOZ
                mouse.MouseY = e.pageY + window.pageYOffset; // + WINDOW FOR MOZ
            };
        };
        // -- END --

        canvas.addEventListener('mousedown', function(e) {
          // SET MOUSE DRAW START TO MOUSE POSITION
          mouse.mouseStartX = mouse.MouseX;
          mouse.mouseStartY = mouse.MouseY;

            // WHEN BOX DRAW BUTTON IS NOT SELECTED OR UN-SELECTED
            if (!boxDrawButton.classList.contains('shadowInsetButton')){
                // IF BOX DRAW BUTTON DOESNT CONTAIN shadowInsetButton, END FUNCTION
                return console.log('end');
            }
            // IF BOX IS NOT EQUAL TO NOTHING, STOP FUNCTION, ELSE CONTINUE ELEMENT(S)
            if (box != null) {
                return 0;
                // ELSE IF STATEMENTS FOR DIFFERENT DRAWING ACTIONS
            } else if(boxDrawButton.classList.contains('shadowInsetButton')){
                box = document.createElement('div');
                box.classList.add('drawnItem','drawnItemBorder', 'box-' + boxCount++,'rectangle','draggable');
              }

              // -- START -- CREATING ELEMENTS EACH ITEM DRAWN
              layer = document.createElement('div');
              layer.className = box.classList[2] + ' layer';
              layer.innerHTML = box.classList[2];
              layerOutput.appendChild(layer);
              $(".layerOutput").sortable();
              canvas.appendChild(box);
              // -- END --

                // -- START -- CREATING ARRAY FOR THE INDEX DATA FROM THE ELEMENTS DRAWN AND MODIFYING THE ARRAY THEN ADDING CLASS TO ELEMENTS TO MATCH THEIR INDEX NUMBER
                // Vital logic for pushing up/down array by one and top and bottom
                // Setting the initial z-index per item drawn
                $(".drawnItem").addClass(function(i) {
                    boxList.push($('.drawnItem'));

                    var rectaToArray = $('.drawnItem').toArray();

                    boxArrayGroup.push(rectaToArray);

                    var boxArrayInitialDefine = boxArrayGroup.slice(-1)[0];

                    var boxArrayDefined = boxArrayInitialDefine.slice(-1)[0];

                    var boxLastIndex = $(boxArrayDefined).index('.drawnItem');

                    box.classList.add('index-' + boxLastIndex);

                    $(box).css('z-index', boxLastIndex);

                    return 0;
                });
                // -- END --

        });

        // -- START -- MOUSE RELEASE FOR DRAWING BOX.
        canvas.addEventListener('mouseup', function(e){
          // box.style.height = box.style.width;

          var drawnItemReleased = document.querySelectorAll('.drawnItem');

          for (i = 0; i < drawnItemReleased.length; i++){
            drawnItemReleasableData = drawnItemReleased[i].getBoundingClientRect();
          }
            drawnItemDataEqualTo = drawnItemReleasableData;

          var boxCountDownOne = boxCount - 1;

          if (boxDrawButton.classList.contains('shadowInsetButton')){
            drawnItemData['box-' + boxCountDownOne] = drawnItemDataEqualTo;
          }

          box = null;
          count++;
          return 0;
        });
        // -- END --

        // -- START -- LOGIC TO DRAG ITEM TO CREATE WIDTH AND HEIGHT
        canvas.addEventListener('mousemove', function(e) {
            setMousePosition(e);
            if (box !== null) {

              var h = document.querySelectorAll('.drawnItem');
              for (i = 0; i < h.length; i++){
                var rect = h[i].getBoundingClientRect();

              }
                box.style.width = Math.abs(mouse.MouseX - mouse.mouseStartX) + 'px'; // Set box width to absolute number of mouse position - mouse's starting position (Removes distance from edge of box to the mouse, would be the same distance between starting position and canvas wall)
                box.style.height = Math.abs(mouse.MouseY - mouse.mouseStartY) + 'px';
                box.style.left = (mouse.MouseX - mouse.mouseStartX < 0) ? mouse.MouseX + 'px' : mouse.mouseStartX + 'px'; // If previous statements (mouse.x - mouse.startX) is less than 0 (in other words, goes into negative axis), add mouse.x as pixels (determines what happens when it goes into the negatives of the x and y axis)
                box.style.top = (mouse.MouseY - mouse.mouseStartY < 0) ? mouse.MouseY + 'px' : mouse.mouseStartY + 'px'; // Determines how much change there should be when switching from negative and positive axis
            }
        });
        // -- END --
    }


});
