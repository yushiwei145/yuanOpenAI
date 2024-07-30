var createAIMessage = (message) => {
  return $('<div></div>', {
    addClass: 'row py-2 ai-message',
  }).html(`
    <div class='col-1 fs-4 text-center'><i class='fas fa-robot'></i></div>
    <div class='col-9'><pre style='white-space: pre-wrap'>${message}</pre></div>
    <div class='col-2'>
      <a class='btn btn-outline-dark'><i class='far fa-thumbs-up'></i></a>
      <a class='btn btn-outline-dark'><i class='far fa-thumbs-down'></i></a>
    </div>
  `);
};

var createHumanMessage = (message) => {
  return $('<div></div>', {
    addClass: 'row py-2 human-message',
  }).html(`
  <div class='col-1 fs-4 text-center'><i class='fas fa-user'></i></div>
  <div class='col-10'><pre style='white-space: pre-wrap'>${message}</pre></div>
  <div class='col-1'></div>
  `);
};

var btn_send_onclick = (event) => {
  // Get required values
  const topicId = $('#txtTopicId').val();
  const message = $('#txtMessage').val();
  const $history = $('#divChatHistory');

  // Create the human message
  const $humanMessage = createHumanMessage(message);
  $history.append($humanMessage);
  $history.scrollTop($history[0].scrollHeight);

  // Request to the server
  $.ajax({
    url: '/api/cogsrch',
    method: 'POST',
    data: { topicId, message },
    success: (data, textStatus, jqXHR) => {
      $('#txtTopicId').val(data.topicId);
      const $aiMessage = createAIMessage(data.message);
      $history.append($aiMessage);
      $history.scrollTop($history[0].scrollHeight);
    },
    error: (jqXHR, textStatus, errorThrown) => {
      alert('Error sending message!');
    }
  });

  // Clear the message
  $('#txtMessage').val('');
  $('#txtMessage').focus();

  // Prevent the form from submitting
  event.preventDefault();
  event.stopPropagation();
  return false;
};

var document_onready = (event) => {
  $('#btnSend').click(btn_send_onclick);
};

$(document).ready(document_onready);