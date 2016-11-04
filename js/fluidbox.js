var $caption = $('<div />', { 'id': 'custom-trigger-1-social' });
$caption
.html('<div class="img-caption"></div><p class="img-desc"></p><ul><li>Share on:</li><li><a href="#">Facebook</a></li><li><a href="#">Pinterest</a></li><li><a href="#">Twitter</a></li></ul>')
.appendTo($('body'));
$(document).on('click', '#custom-trigger-1-social', function(e) {
    e.preventDefault();
});

// Initialize Fluidbox
$('#custom-trigger-1')
.fluidbox()
.on('openend.fluidbox', function() {
    var $img = $(this).find('img');
    $('#custom-trigger-1-social')
    .addClass('visible')
    .find('.img-caption')
        .text($img.attr('title'))
        .next('.img-desc')
            .text($img.attr('alt'));
})
.on('closestart.fluidbox', function() {
    $('#custom-trigger-1-social').removeClass('visible');
});

// Call public methods
$(window).scroll(function() {
  $('#custom-event-2').fluidbox('close');
});