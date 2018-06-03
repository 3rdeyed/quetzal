$(document).ready(function() {
  $('.fresh').on("keydown paste", function(e) {
    console.log('KEYDOWN or PASTE')
    if($(this).hasClass('fresh'))
    {
        $(this).removeClass('fresh')
        $(this).text('')
        $(this).val('')

        //$('.input-add .btn:input[type="submit"]')
        $(this).closest("form").find('.btn:input[type="submit"]')
          .prop('disabled', false)
    }
  })

  $('.note').click(function() {
    var eNote = $(this);
    // note is selected? -> unselect
    if( $(this).hasClass('selected') ) {

      // unselect element

      $(this).removeClass('selected');

      // remove hidden field from cloud link buttons

      $('#move-to-cloud form input[value=' +eNote.attr('noteId')+ ']').remove()

      // no more notes selected? -> switch to see-clouds
      if($('.note.selected').length == 0) {
        $('#see-clouds').show();
        $('#move-to-cloud').hide();
      }
    } else {

      // select one note

      if($('.note.selected').length == 0) {
        $('#see-clouds').hide();
        $('#move-to-cloud').show();
      }
      $(this).addClass('selected');

      // iterate over buttons' forms and add fields

      $('#move-to-cloud form').each(function(i,e) {
        //var eNoteId = $('<input type="hidden" name="noteIds[]" value="' +
        //              eNote.attr('noteId') + '" />');

        var eField = $('<input type="hidden"' +
                         'name="noteIds[]" ' +
                         'value="' + eNote.attr('noteId') +
                       '">')

        $(this).prepend( eField )

        console.log('>>> ' + i)
        console.log('>>> ' + $(this).html())
      })
      /**/
    }

    // are notes selected?
    if($('.note.selected').length > 0) {
        $('#see-clouds').hide();
        $('#move-to-cloud').show();
    } else {
      $('.clouds .cloud').each(function(i,e) {
        $('#see-clouds').show();
        $('#move-to-cloud').hide();
      })
    }
  })
})
